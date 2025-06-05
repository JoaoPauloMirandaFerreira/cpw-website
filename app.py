app.py
import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import base64

app = Flask(__name__)
CORS(app)

# Configuração do Google Sheets
SCOPES = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
# Substitua pelo conteúdo do seu arquivo de credenciais do Google Cloud
CREDS_JSON = os.getenv('GOOGLE_CREDS_JSON')
creds_dict = json.loads(base64.b64decode(CREDS_JSON).decode('utf-8'))
creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, SCOPES)
client = gspread.authorize(creds)
# ID da planilha vinculada ao Google Forms
SHEET_ID = 'YOUR_GOOGLE_SHEET_ID' # Substitua pelo ID da planilha
sheet = client.open_by_id(SHEET_ID).sheet1

# Dados simulados (JSON para persistência simples)
DATA_DIR = 'data'
os.makedirs(DATA_DIR, exist_ok=True)
SERVICES_FILE = os.path.join(DATA_DIR, 'services.json')
TESTIMONIALS_FILE = os.path.join(DATA_DIR, 'testimonials.json')
BLOG_FILE = os.path.join(DATA_DIR, 'blog.json')
PORTFOLIO_FILE = os.path.join(DATA_DIR, 'portfolio.json')

def load_json(file):
    try:
        with open(file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_json(file, data):
    try:
        with open(file, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Erro ao salvar {file}: {e}")

# Admin (senha fixa para simplificar, use .env em produção)
ADMIN_EMAIL = 'admin@cpw.com'
ADMIN_PASSWORD = 'securepassword123'

# Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if data.get('email') == ADMIN_EMAIL and data.get('password') == ADMIN_PASSWORD:
        return jsonify({'token': 'mock-token'}), 200 # Futuro: gerar JWT
    return jsonify({'message': 'Credenciais inválidas'}), 401

# Briefings (Google Sheets)
@app.route('/api/briefings', methods=['GET'])
def get_briefings():
    try:
        if not request.headers.get('Authorization') == 'Bearer mock-token':
            return jsonify({'error': 'Não autorizado'}), 401
        records = sheet.get_all_records()
        briefings = [
            {'id': idx + 1, 'name': rec.get('Nome'), 'email': rec.get('E-mail'), 'project': rec.get('Projeto'), 'timestamp': rec.get('Carimbo de data/hora')}
            for idx, rec in enumerate(records)
        ]
        return jsonify(briefings)
    except Exception as e:
        print(f"Erro ao carregar os briefings: {e}")
        return jsonify({'error': 'Erro ao carregar os briefings'}), 500

# Serviços CRUD
@app.route('/api/services', methods=['GET'])
def get_services():
    services = load_json(SERVICES_FILE)
    return jsonify(services)

@app.route('/api/services', methods=['POST', 'PUT'])
def manage_service():
    if request.headers.get('Authorization') != 'Bearer mock-token':
        return jsonify({'error': 'Não autorizado'}), 401
    data = request.get_json()
    services = data.get('id') or str(len(services) + 1)
    services = load_json(SERVICES_FILE)
    if request.method == 'POST':
        new_service = {'id': services, 'title': data.get('title'), 'description': data.get('description')}
        services.append(new_service)
    else:
        for service in services:
            if service['id'] == data['id']:
                service['title'] = data.get('title')
                service['description'] = data.get('description')
                break
    save_json(SERVICES_FILE, services)
    return jsonify(new_service or service), 201 if request.method == 'POST' else 200

@app.route('/api/services/<id>', methods=['DELETE'])
def delete_service(id):
    if request.headers.get('Authorization') != 'Bearer mock-token':
        return jsonify({'error': 'Não autorizado'}), 401
    services = load_json(SERVICES_FILE)
    services = [s for s in services if s['id'] != id]
    save_json(SERVICES_FILE, services)
    return jsonify({'message': 'Serviço deletado'}), 200

# Testemunhos CRUD (similar aos serviços)
@app.route('/api/testimonials', methods=['GET'])
def get_testimonials():
    return jsonify(load_json(TESTIMONIALS_FILE))

@app.route('/api/testimonials', methods=['POST', 'PUT'])
def manage_testimonial():
    if request.headers.get('Authorization') != 'Bearer mock-token':
        return jsonify({'error': 'Não autorizado'}), 401
    data = request.get_json()
    testimonials = load_json(TESTIMONIALS_FILE)
    testimonial_id = data.get('id') or str(len(testimonials) + 1)
    if request.method == 'POST':
        new_testimonial = {'id': testimonial_id, 'content': data.get('content'), 'author': data.get('author'), 'company': data.get('company') or ''}
        testimonials.append(new_testimonial)
    else:
        for testimonial in testimonials:
            if testimonial['id'] == data['id']:
                testimonial['content'] = data.get('content')
                testimonial['author'] = data.get('author')
                testimonial['company'] = data.get('company', '')
                break
    save_json(TESTIMONIALS_FILE, testimonials)
    return jsonify(new_testimonial or testimonial), 201 if request.method == 'POST' else 200

@app.route('/api/testimonials/<id>', methods=['DELETE'])
def delete_testimonial(id):
    if request.headers.get('Authorization') != 'Bearer mock-token':
        return jsonify({'error': 'Não autorizado'}), 401
    testimonials = load_json(TESTIMONIALS_FILE)
    testimonials = [t for t in testimonials if t['id'] != id]
    save_json(TESTIMONIALS_FILE, testimonials)
    return jsonify({'message': 'Testemunho deletado'}), 200

# Blog CRUD
@app.route('/api/blog', methods=['GET'])
def get():
    blog_posts = load_json(BLOG_FILE)
    return jsonify(blog_posts)

@app.route('/api/blog', methods=['POST', 'PUT'])
def manage_post():
    try:
        if request.headers.get('Authorization') != 'Bearer mock-token':
            return jsonify({'error': 'Não autorizado'}), 401
        data = request.form
        file = request.files.get('image')
        blog_posts = load_json(BLOG_FILE)
        post_id = data.get('id') or str(len(blog_posts) + 1)
        image_url = ''
        if file:
            # Salvar imagem (simulado, usar um storage como S3 em produção)
            image_path = os.path.join('static/uploads', file.filename)
            file.save(image_path)
            image_url = f'/uploads/{file.filename}'
        new_post = {
            'id': post_id,
            'title': data.get('title'),
            'content': data.get('content'),
            'image_url': image_url or data.get('image_url', '')
        }
        if request.method == 'POST':
            blog_posts.append(new_post)
        else:
            for post in blog_posts:
                if post['id'] == data['id']:
                    post['title'] = data.get('title')
                    post['content'] = data.get('content')
                    if image_url:
                        post['image_url'] = image_url
                    break
        save_json(BLOG_FILE, blog_posts)
        return jsonify(new_post), 201 if request.method == 'POST' else 200

    except Exception as e:
        print(f"Erro ao gerenciar post: {e}")
        return jsonify({'error': 'Erro ao salvar post'}), 500

@app.route('/api/blog/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    if request.headers.get('Authorization') != 'Bearer mock-token':
        return jsonify({'error': 'Não autorizado'}), 401
    blog_posts = load_json(BLOG_FILE)
    blog_posts = [p for p in blog_posts if p['id'] != post_id]
    save_json(BLOG_FILE, blog_posts)
    return jsonify({'message': 'Post deletedado'}), 200

# Portfólio CRUD
@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    portfolio = load_json(PORTFOLIO_FILE)
    return jsonify(portfolio)

@app.route('/api/portfolio', methods=['POST', 'PUT'])
def manage_portfolio():
    try:
        if request.headers.get('Authorization') != 'Bearer mock-token':
            return jsonify({'error': 'Não autorizado'}), 401
        data = request.form
        file = request.files.get('file')
        portfolio = load_json(PORTFOLIO_FILE)
        portfolio_id = data.get('id') or str(len(portfolio) + 1)
        image_url = ''
        if file:
            image_path = os.path.join('static/uploads/portfolio', file.filename)
            file.save(image_path)
            image_url = f'/portfolio/{file.filename}'
        new_item = {
            'id': portfolio_id,
            'title': data.get('title'),
            'description': data.get('description'),
            'image_url': image_url or data.get('image')
        }
        if request.method == 'POST':
            portfolio.append(new_item)
        else:
            for item in portfolio:
                if item['id'] == data['id']:
                    item['title'] = data.get('title')
                    item['description'] = data.get('description')
                    if image_url:
                        item['image_url'] = image_url
                    break
        save_json(PORTFOLIO_FILE, portfolio)
        return jsonify(new_item), 201 if request.method == 'POST' else 200

    except Exception as e:
        print(f"Erro ao gerenciar portfólio: {e}")
        return jsonify({'error': 'Erro ao salvar item'}), 500

@app.route('/api/portfolio/<id>', methods=['DELETE'])
def delete_portfolio_item(id):
    if request.headers.get('Authorization') != 'Bearer mock-token':
        return jsonify({'error': 'Não autorizado'}), 401
    portfolio = load_json(PORTFOLIO_FILE)
    portfolio = [item for item in portfolio if item['id'] != id]
    save_json(PORTFOLIO_FILE, portfolio)
    return jsonify({'message': 'Item do portfólio deletado'}), 200

if __name__ == '__main__':
    os.makedirs('static/uploads', exist_ok=True)
    os.makedirs('static/uploads/portfolio', exist_ok=True)
    app.run(debug=True, port=5000)