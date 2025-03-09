import tkinter as tk
from tkinter import messagebox
import sqlite3
from datetime import datetime

# Classe principal do sistema ERP
class ERPApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Shady ERP")
        self.root.geometry("1000x700")
        self.root.configure(bg="#f0f0f0")
        
        self.caixa_aberto = False  # se o caixa ta aberto ou não
        self.conectar_banco()  # conectar banco
        
        # o titulo do app
        tk.Label(root, text="Shady ERP", font=("Arial", 24, "bold"), bg="#f0f0f0").pack(pady=20)
        
        # cria os botão e os coloca na tela
        button_frame = tk.Frame(root, bg="#f0f0f0")
        button_frame.pack(pady=20)
        
        # deixa eles bonito
        self.button_style = {"font": ("Arial", 14), "bg": "#4CAF50", "fg": "white", "activebackground": "#45a049", "bd": 0, "height": 2}
        
        # cria os botão e da função
        tk.Button(button_frame, text="Abrir Caixa", command=self.abrir_caixa, **self.button_style).pack(fill='x', pady=5)
        tk.Button(button_frame, text="Fechar Caixa", command=self.fechar_caixa, **self.button_style).pack(fill='x', pady=5)
        tk.Button(button_frame, text="Fazer Venda", command=self.fazer_venda, **self.button_style).pack(fill='x', pady=5)
        tk.Button(button_frame, text="Consultar Estoque", command=self.consultar_estoque, **self.button_style).pack(fill='x', pady=5)
        tk.Button(button_frame, text="Fazer Pedido", command=self.fazer_pedido, **self.button_style).pack(fill='x', pady=5)
        tk.Button(button_frame, text="Relatório", command=self.gerar_relatorio, **self.button_style).pack(fill='x', pady=5)
    
    # função para conectar ao banco de dados e criar tabelas se não existirem
    def conectar_banco(self):
        self.conn = sqlite3.connect("erp.db")
        self.cursor = self.conn.cursor()
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS estoque (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                produto TEXT NOT NULL,
                quantidade INTEGER NOT NULL
            )
        """)
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                produto TEXT NOT NULL,
                quantidade INTEGER NOT NULL,
                data TEXT NOT NULL
            )
        """)
        self.cursor.execute("PRAGMA table_info(vendas)")
        columns = [column[1] for column in self.cursor.fetchall()]
        if 'quantidade' not in columns:
            self.cursor.execute("ALTER TABLE vendas ADD COLUMN quantidade INTEGER")
        self.conn.commit()
    
    # função para abrir o caixa
    def abrir_caixa(self):
        self.caixa_aberto = True
        messagebox.showinfo("Caixa", "Caixa aberto com sucesso!")
    
    # função para fechar o caixa
    def fechar_caixa(self):
        if self.caixa_aberto:
            self.caixa_aberto = False
            messagebox.showinfo("Caixa", "Caixa fechado com sucesso!")
        else:
            messagebox.showwarning("Aviso", "O caixa já está fechado!")
    
    # função para realizar uma venda
    def fazer_venda(self):
        if not self.caixa_aberto:
            messagebox.showwarning("Aviso", "Abra o caixa primeiro!")
            return
        
        # cria uma nova janela para a venda
        venda_window = tk.Toplevel(self.root)
        venda_window.title("Fazer Venda")
        venda_window.geometry("300x200")
        venda_window.configure(bg="#f0f0f0")
        
        # campos para entrada de dados do produto e quantidade
        tk.Label(venda_window, text="Produto:", bg="#f0f0f0").pack(pady=5)
        produto_entry = tk.Entry(venda_window)
        produto_entry.pack(pady=5)
        
        tk.Label(venda_window, text="Quantidade:", bg="#f0f0f0").pack(pady=5)
        quantidade_entry = tk.Entry(venda_window)
        quantidade_entry.pack(pady=5)
        
        # função interna para processar a venda
        def vender():
            produto = produto_entry.get()
            try:
                quantidade = int(quantidade_entry.get())
                self.cursor.execute("SELECT quantidade FROM estoque WHERE produto = ?", (produto,))
                resultado = self.cursor.fetchone()
                if resultado is None:
                    messagebox.showwarning("Erro", "Produto não encontrado no estoque! Verifique o nome do produto.")
                elif resultado[0] >= quantidade:
                    nova_qtd = resultado[0] - quantidade
                    self.cursor.execute("UPDATE estoque SET quantidade = ? WHERE produto = ?", (nova_qtd, produto))
                    self.conn.commit()
                    data_venda = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    self.cursor.execute("INSERT INTO vendas (produto, quantidade, data) VALUES (?, ?, ?)", (produto, quantidade, data_venda))
                    self.conn.commit()
                    messagebox.showinfo("Venda", "Venda realizada com sucesso!")
                else:
                    messagebox.showwarning("Erro", "Estoque insuficiente!")
            except ValueError:
                messagebox.showerror("Erro", "Digite um número válido!")
        
        # botão para confirmar a venda
        tk.Button(venda_window, text="Vender", command=vender, **self.button_style).pack(pady=10)
    
    # função para consultar o estoque
    def consultar_estoque(self):
        estoque_window = tk.Toplevel(self.root)
        estoque_window.title("Estoque")
        estoque_window.geometry("300x200")
        estoque_window.configure(bg="#f0f0f0")
        
        tk.Label(estoque_window, text="Estoque Atual:", bg="#f0f0f0").pack(pady=10)
        self.cursor.execute("SELECT produto, quantidade FROM estoque")
        for produto, qtd in self.cursor.fetchall():
            tk.Label(estoque_window, text=f"{produto}: {qtd}", bg="#f0f0f0").pack()
    
    # função para fazer um pedido de reposição de estoque
    def fazer_pedido(self):
        pedido_window = tk.Toplevel(self.root)
        pedido_window.title("Fazer Pedido")
        pedido_window.geometry("300x200")
        pedido_window.configure(bg="#f0f0f0")
        
        tk.Label(pedido_window, text="Produto:", bg="#f0f0f0").pack(pady=5)
        produto_entry = tk.Entry(pedido_window)
        produto_entry.pack(pady=5)
        
        tk.Label(pedido_window, text="Quantidade:", bg="#f0f0f0").pack(pady=5)
        quantidade_entry = tk.Entry(pedido_window)
        quantidade_entry.pack(pady=5)
        
        # função interna para processar o pedido
        def pedir():
            produto = produto_entry.get()
            try:
                quantidade = int(quantidade_entry.get())
                self.cursor.execute("SELECT quantidade FROM estoque WHERE produto = ?", (produto,))
                resultado = self.cursor.fetchone()
                if resultado:
                    nova_qtd = resultado[0] + quantidade
                    self.cursor.execute("UPDATE estoque SET quantidade = ? WHERE produto = ?", (nova_qtd, produto))
                else:
                    self.cursor.execute("INSERT INTO estoque (produto, quantidade) VALUES (?, ?)", (produto, quantidade))
                self.conn.commit()
                messagebox.showinfo("Pedido", "Pedido realizado com sucesso!")
            except ValueError:
                messagebox.showerror("Erro", "Digite um número válido!")
        
        # botão para confirmar o pedido
        tk.Button(pedido_window, text="Pedir", command=pedir, **self.button_style).pack(pady=10)
    
    # função para gerar um relatório de vendas
    def gerar_relatorio(self):
        relatorio_window = tk.Toplevel(self.root)
        relatorio_window.title("Relatório de Vendas")
        relatorio_window.geometry("400x300")
        relatorio_window.configure(bg="#f0f0f0")
        
        tk.Label(relatorio_window, text="Relatório de Vendas:", bg="#f0f0f0").pack(pady=10)
        self.cursor.execute("SELECT produto, quantidade, data FROM vendas")
        for produto, quantidade, data in self.cursor.fetchall():
            tk.Label(relatorio_window, text=f"{data} - {produto} - {quantidade} unidades", bg="#f0f0f0").pack()

# inicializa a aplicação
if __name__ == "__main__":
    root = tk.Tk()
    app = ERPApp(root)
    root.mainloop()