from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
from datetime import datetime

app = Flask(__name__)
app.secret_key = "agenda_super_secreta"

# ---------------- BANCO ----------------

def conectar():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn


def criar_tabelas():
    conn = conectar()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        data TEXT,
        horario TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        acao TEXT,
        descricao TEXT,
        data_hora TEXT
    )
    """)

    conn.commit()
    conn.close()


criar_tabelas()

# ---------------- LOG ----------------

def registrar_log(acao, descricao):
    conn = conectar()
    conn.execute("""
        INSERT INTO logs (acao, descricao, data_hora)
        VALUES (?, ?, ?)
    """, (acao, descricao, datetime.now().strftime("%d/%m/%Y %H:%M:%S")))
    conn.commit()
    conn.close()

# ---------------- LOGIN ----------------

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        nome = request.form['nome'].strip()

        if nome:
            session['usuario'] = nome
            return redirect(url_for('index'))

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('usuario', None)
    return redirect(url_for('login'))

# ---------------- ROTAS ----------------

@app.route('/')
def index():
    if 'usuario' not in session:
        return redirect(url_for('login'))

    usuario = session['usuario']

    filtro = request.args.get('filtro', '')
    data = request.args.get('data', '')

    conn = conectar()

    query = "SELECT * FROM agendamentos WHERE 1=1"
    params = []

    if filtro:
        query += " AND nome LIKE ?"
        params.append(f"%{filtro}%")

    if data:
        query += " AND data = ?"
        params.append(data)

    query += " ORDER BY data ASC, horario ASC"

    rows = conn.execute(query, params).fetchall()

    logs = conn.execute("SELECT * FROM logs ORDER BY id DESC").fetchall()

    total_geral = conn.execute("SELECT COUNT(*) AS total FROM agendamentos").fetchone()["total"]

    hoje_raw = datetime.now().strftime("%Y-%m-%d")

    ag_hoje = conn.execute("""
        SELECT COUNT(*) AS total
        FROM agendamentos
        WHERE data = ?
    """, (hoje_raw,)).fetchone()["total"]

    proximo = conn.execute("""
        SELECT *
        FROM agendamentos
        WHERE data >= ?
        ORDER BY data ASC, horario ASC
        LIMIT 1
    """, (hoje_raw,)).fetchone()

    ultimo = conn.execute("""
        SELECT *
        FROM agendamentos
        ORDER BY id DESC
        LIMIT 1
    """).fetchone()

    conn.close()

    agendamentos = []
    for r in rows:
        data_br = "/".join(reversed(r["data"].split("-")))

        agendamentos.append({
            "id": r["id"],
            "nome": r["nome"],
            "data": data_br,
            "data_raw": r["data"],
            "horario": r["horario"]
        })

    return render_template(
        'index.html',
        agendamentos=agendamentos,
        logs=logs,
        total=total_geral,
        hoje=ag_hoje,
        proximo=proximo,
        ultimo=ultimo,
        usuario=usuario
    )


@app.route('/add', methods=['POST'])
def add():
    if 'usuario' not in session:
        return redirect(url_for('login'))

    nome = request.form['nome'].strip()
    data = request.form['data']
    horario = request.form['horario']
    usuario = session['usuario']

    conn = conectar()

    existente = conn.execute("""
        SELECT * FROM agendamentos
        WHERE data=? AND horario=?
    """, (data, horario)).fetchone()

    if existente:
        conn.close()
        registrar_log("BLOQUEADO", f"{usuario} tentou criar agendamento em horário ocupado: {data} {horario}")
        return redirect(url_for('index'))

    conn.execute("""
        INSERT INTO agendamentos (nome, data, horario)
        VALUES (?, ?, ?)
    """, (nome, data, horario))

    conn.commit()
    conn.close()

    registrar_log("CRIADO", f"{usuario} criou: {nome} - {data} {horario}")

    return redirect(url_for('index'))


@app.route('/delete/<int:id>')
def delete(id):
    if 'usuario' not in session:
        return redirect(url_for('login'))

    usuario = session['usuario']

    conn = conectar()

    ag = conn.execute("SELECT * FROM agendamentos WHERE id=?", (id,)).fetchone()

    conn.execute("DELETE FROM agendamentos WHERE id=?", (id,))
    conn.commit()
    conn.close()

    if ag:
        registrar_log("EXCLUIDO", f"{usuario} removeu: {ag['nome']} - {ag['data']} {ag['horario']}")

    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(debug=True)