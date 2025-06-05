app.js
try {
  console.log('Verificando dependências...');
  if (typeof React === 'undefined') throw new Error('React não foi carregado');
  if (typeof ReactDOM === 'undefined') throw new Error('ReactDOM não foi carregado');
  if (typeof Babel === 'undefined') throw new Error('Babel não foi carregado');
  console.log('Dependências carregadas com sucesso');

  console.log('Iniciando script React...');

  // Componente Modal
  function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;
    console.log('Renderizando Modal');
    return (
      <div className="modal">
        <div className="modal-content">
          <button className="close" onClick={onClose}>X</button>
          {children}
        </div>
      </div>
    );
  }

  // Componente Principal
  function App() {
    console.log('Montando componente App...');
    const [services, setServices] = React.useState([
      { id: 1, title: "Criação de Páginas Web", description: "Desenvolvemos páginas web modernas..." },
      { id: 2, title: "Desenvolvimento de Home Pages", description: "Criamos home pages impactantes..." },
      { id: 3, title: "Criação de Blogs", description: "Construímos blogs otimizados..." },
      { id: 4, title: "Páginas de Serviços", description: "Desenvolvemos páginas dedicadas..." },
      { id: 5, title: "Sistemas Personalizados", description: "Criamos sistemas sob medida..." }
    ]);
    const [testimonials, setTestimonials] = React.useState([
      { id: 1, content: "A CPW transformou nossa presença online...", author: "Ana Silva", company: "TechCorp" },
      { id: 2, content: "O sistema personalizado que desenvolveram...", author: "João Mendes", company: "GrowEasy" }
    ]);
    const [blogPosts, setBlogPosts] = React.useState([
      { id: 1, title: "5 Dicas para Melhorar o SEO do Seu Site", content: "O SEO é essencial...", image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80" },
      { id: 2, title: "Como Criar uma Home Page que Converte", content: "Uma home page bem projetada...", image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80" },
      { id: 3, title: "O Futuro do Desenvolvimento Web em 2025", content: "Exploramos as tendências...", image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80" }
    ]);
    const [portfolioItems, setPortfolioItems] = React.useState([
      { id: 1, title: "Site Corporativo TechCorp", description: "Um site moderno...", image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80" },
      { id: 2, title: "Blog de Viagens", description: "Um blog vibrante...", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80" },
      { id: 3, title: "Sistema de Gestão GrowEasy", description: "Um CRM personalizado...", image_url: "https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80" }
    ]);
    const [briefings, setBriefings] = React.useState([]);
    const [token, setToken] = React.useState(null);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalType, setModalType] = React.useState('');
    const [editItem, setEditItem] = React.useState(null);
    const [error, setError] = React.useState(null);

    // Carregar dados do backend
    React.useEffect(() => {
      if (isAdmin) {
        fetch('/api/briefings', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => setBriefings(data))
          .catch(err => console.error('Erro ao carregar briefings:', err));
      }
    }, [isAdmin, token]);

    // Função de login
    const handleLogin = async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value;
      const password = document.getElementById('admin-password').value;
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          setToken(data.token);
          setIsAdmin(true);
          setError(null);
        } else {
          setError(data.message || 'Erro ao fazer login');
        }
      } catch (err) {
        setError('Erro de conexão com o servidor');
        console.error('Erro de login:', err);
      }
    };

    // Funções para gerenciar serviços
    const handleServiceSubmit = async (e) => {
      e.preventDefault();
      const title = e.target.title.value;
      const description = e.target.description.value;
      try {
        const res = await fetch('/api/services', {
          method: editItem ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ id: editItem?.id, title, description })
        });
        if (res.ok) {
          const data = await res.json();
          setServices(editItem ? services.map(s => s.id === data.id ? data : s) : [...services, data]);
          setModalOpen(false);
          setEditItem(null);
        } else {
          setError('Erro ao salvar serviço');
        }
      } catch (err) {
        setError('Erro de conexão');
        console.error('Erro ao salvar serviço:', err);
      }
    };

    const handleDeleteService = async (id) => {
      try {
        const res = await fetch(`/api/services/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setServices(services.filter(s => s.id !== id));
        } else {
          setError('Erro ao excluir serviço');
        }
      } catch (err) {
        setError('Erro de conexão');
        console.error('Erro ao excluir serviço:', err);
      }
    };

    // Funções para gerenciar depoimentos
    const handleTestimonialSubmit = async (e) => {
      e.preventDefault();
      const content = e.target.content.value;
      const author = e.target.author.value;
      const company = e.target.company.value;
      try {
        const res = await fetch('/api/testimonials', {
          method: editItem ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ id: editItem?.id, content, author, company })
        });
        if (res.ok) {
          const data = await res.json();
          setTestimonials(editItem ? testimonials.map(t => t.id === data.id ? data : t) : [...testimonials, data]);
          setModalOpen(false);
          setEditItem(null);
        } else {
          setError('Erro ao salvar depoimento');
        }
      } catch (err) {
        setError('Erro de conexão');
        console.error('Erro ao salvar depoimento:', err);
      }
    };

    const handleDeleteTestimonial = async (id) => {
      try {
        const res = await fetch(`/api/testimonials/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setTestimonials(testimonials.filter(t => t.id !== id));
        } else {
          setError('Erro ao excluir depoimento');
        }
      } catch (err) {
        setError('Erro de conexão');
        console.error('Erro ao excluir depoimento:', err);
      }
    };

    // Funções para gerenciar posts de blog
    const handleBlogSubmit = async (e) => {
      e.preventDefault();
      const title = e.target.title.value;
      const content = e.target.content.value;
      const image = e.target.image.files[0];
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) formData.append('image', image);
      if (editItem) formData.append('id', editItem.id);
      try {
        const res = await fetch('/api/blog', {
          method: editItem ? 'PUT' : 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setBlogPosts(editItem ? blogPosts.map(b => b.id === data.id ? data : b) : [...blogPosts, data]);
          setModalOpen(false);
          setEditItem(null);
        } else {
          setError('Erro ao salvar post');
        }
      } catch (err) {
        setError('Erro de conexão');
        console.error('Erro ao salvar post:', err);
      }
    };

    const handleDeleteBlogPost = async (id) => {
      try {
        const res = await fetch(`/api/blog/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setBlogPosts(blogPosts.filter(b => b.id !== id));
        } else {
          setError('Erro ao excluir post');
        }
      } catch (err) {
        setError('Erro de conexão');
        console.error('Erro ao excluir post:', err);
      }
    };

    // Funções para gerenciar portfólio
    const handlePortfolioSubmit = async (e) => {
      e.preventDefault();
      const title = e.target.title.value;
      const description = e.target.description.value;
      const file = e.target.file.files[0];
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (file) formData.append('file', file);
      if (editItem) formData.append('id', editItem.id);
      try {
        const res = await fetch('/api/portfolio', {
          method: editItem ? 'PUT' : 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setPortfolioItems(editItem ? portfolioItems.map(p => p.id === data.id ? data : p) : [...portfolioItems, data]);
          setModalOpen(false);
          setEditItem(null);
        } else {
          setError('Erro ao salvar item de portfólio');
        }
      } catch (err) {
        setError('Erro de conexão');
        console.error('Erro ao salvar portfólio:', err);
      }
    };

    const handleDeletePortfolioItem = async (id) => {
      try {
        const res = await fetch(`/api/portfolio/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setPortfolioItems(portfolioItems.filter(p => p.id !== id));
        } else {
          setError('Erro ao excluir item de portfólio');
        }
      } catch (err) {
        setError('Erro de conexão');
        console.error('Erro ao excluir portfólio:', err);
      }
    };

    // Abrir modal
    const openModal = (type, item = null) => {
      console.log(`Abrindo modal para ${type}`, item);
      setModalType(type);
      setEditItem(item);
      setModalOpen(true);
    };

    console.log('Renderizando App...');
    return (
      <div>
        {error && <div className="error-message">{error}</div>}
        {/* Cabeçalho */}
        <header className="header">
          <div className="container flex justify-between items-center">
            <h1 className="text-3xl font-bold">CPW</h1>
            <nav>
              <ul>
                <li><a href="#sobre">Sobre</a></li>
                <li><a href="#servicos">Serviços</a></li>
                <li><a href="#portfolio">Portfólio</a></li>
                <li><a href="#depoimentos">Depoimentos</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#contato">Contato</a></li>
              </ul>
            </nav>
          </div>
        </header>

        {/* Seção Hero */}
        <section id="hero" className="section" style={{ background: 'linear-gradient(to bottom, #E5E7EB, #D1D5DB)' }}>
          <div className="container">
            <h2 style={{ fontSize: '48px', fontWeight: '700', color: '#1F2937', marginBottom: '16px' }}>
              Transforme Sua Ideia em Realidade com a CPW
            </h2>
            <p style={{ fontSize: '20px', color: '#4B5563', marginBottom: '32px' }}>
              Desenvolvemos ambientes web, sistemas e aplicativos personalizados com paixão e inovação.
            </p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeWvZHZy87pAoIyGP3B3SevFCDag7xqoIpJxtxBtnTE7O4hPA/viewform"
              target="_blank"
              className="button orange"
            >
              Solicite um Orçamento
            </a>
          </div>
        </section>

        {/* Seção Sobre */}
        <section id="sobre" className="section">
          <div className="container">
            <h2>Sobre a CPW</h2>
            <p>
              A Creattion Project Web é sua parceira em soluções digitais inovadoras. Nossa missão é transformar ideias em realidades digitais, criando websites, sistemas e aplicativos que impulsionam negócios.
            </p>
          </div>
        </section>

        {/* Seção Serviços */}
        <section id="servicos" className="section" style={{ background: '#F3F4F6' }}>
          <div className="container">
            <h2>Nossos Serviços</h2>
            {isAdmin && (
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <button
                  className="button green"
                  onClick={() => openModal('service')}
                >
                  Adicionar Serviço
                </button>
              </div>
            )}
            <div className="grid">
              {services.map(service => (
                <div key={service.id} className="card">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  {isAdmin && (
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        className="button"
                        onClick={() => openModal('service', service)}
                      >
                        Editar
                      </button>
                      <button
                        className="button red"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seção Portfólio */}
        <section id="portfolio" className="section">
          <div className="container">
            <h2>Portfólio</h2>
            {isAdmin && (
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <button
                  className="button green"
                  onClick={() => openModal('portfolio')}
                >
                  Adicionar Item de Portfólio
                </button>
              </div>
            )}
            <div className="grid">
              {portfolioItems.map(item => (
                <div key={item.id} className="card">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    onError={(e) => { 
                      e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+Indisponível'; 
                      console.error('Erro ao carregar imagem:', item.image_url); 
                    }} 
                  />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {isAdmin && (
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        className="button"
                        onClick={() => openModal('portfolio', item)}
                      >
                        Editar
                      </button>
                      <button
                        className="button red"
                        onClick={() => handleDeletePortfolioItem(item.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seção Depoimentos */}
        <section id="depoimentos" className="section" style={{ background: '#F3F4F6' }}>
          <div className="container">
            <h2>O Que Nossos Clientes Dizem</h2>
            {isAdmin && (
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <button
                  className="button green"
                  onClick={() => openModal('testimonial')}
                >
                  Adicionar Depoimento
                </button>
              </div>
            )}
            <div className="grid">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="card">
                  <p style={{ fontStyle: 'italic', marginBottom: '16px', color: '#4B5563' }}>{testimonial.content}</p>
                  <p style={{ color: '#3B82F6', fontWeight: '600' }}>{testimonial.author}, {testimonial.company || 'N/A'}</p>
                  {isAdmin && (
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        className="button"
                        onClick={() => openModal('testimonial', testimonial)}
                      >
                        Editar
                      </button>
                      <button
                        className="button red"
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seção Blog/Notícias */}
        <section id="blog" className="section">
          <div className="container">
            <h2>Blog e Novidades</h2>
            {isAdmin && (
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <button
                  className="button green"
                  onClick={() => openModal('blog')}
                >
                  Adicionar Post
                </button>
              </div>
            )}
            <div className="grid">
              {blogPosts.map(post => (
                <div key={post.id} className="card">
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    onError={(e) => { 
                      e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+Indisponível'; 
                      console.error('Erro ao carregar imagem:', post.image_url); 
                    }} 
                  />
                  <h3>{post.title}</h3>
                  <p>{post.content.slice(0, 120)}...</p>
                  <a href="#" style={{ color: '#3B82F6', textDecoration: 'underline', display: 'inline-block', marginTop: '12px', fontWeight: '600' }}>
                    Leia Mais
                  </a>
                  {isAdmin && (
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button 
                        className="button"
                        onClick={() => openModal('blog', post)}
                      >
                        Editar
                      </button>
                      <button
                        className="button red"
                        onClick={() => handleDeleteBlogPost(post.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seção Admin */}
        <section id="admin" className="section" style={{ background: '#F3F4F6' }}>
          <div className="container">
            <h2>Área do Administrador</h2>
            {isAdmin ? (
              <div>
                <button
                  className="button"
                  onClick={() => { setToken(null); setIsAdmin(false); console.log('Logout efetuado'); }}
                >
                  Sair
                </button>
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Briefings Recebidos</h3>
                  {briefings.length === 0 ? (
                    <p>Nenhum briefing recebido.</p>
                  ) : (
                    <div className="grid">
                      {briefings.map(briefing => (
                        <div key={briefing.id} className="card">
                          <p><strong>Nome:</strong> {briefing.name}</p>
                          <p><strong>E-mail:</strong> {briefing.email}</p>
                          <p><strong>Projeto:</strong> {briefing.project}</p>
                          <p><strong>Data:</strong> {new Date(briefing.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <input
                  type="email"
                  id="admin-email"
                  placeholder="E-mail"
                  style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  required
                />
                <input
                  type="password"
                  id="admin-password"
                  placeholder="Senha"
                  style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  required
                />
                <button
                  type="button"
                  className="button"
                  onClick={handleLogin}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Modal para Formulários */}
        <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); console.log('Modal fechado'); }}>
          {modalType === 'service' && (
            <form onSubmit={handleServiceSubmit}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                {editItem ? 'Editar Serviço' : 'Adicionar Serviço'}
              </h3>
              <input
                type="text"
                name="title"
                defaultValue={editItem?.title || ''}
                placeholder="Título"
                required
              />
              <textarea
                name="description"
                defaultValue={editItem?.description || ''}
                placeholder="Descrição"
                required
              />
              <button type="submit" className="button">
                Salvar
              </button>
            </form>
          )}
          {modalType === 'testimonial' && (
            <form onSubmit={handleTestimonialSubmit}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                {editItem ? 'Editar Depoimento' : 'Adicionar Depoimento'}
              </h3>
              <textarea
                name="content"
                defaultValue={editItem?.content || ''}
                placeholder="Conteúdo do depoimento"
                required
              />
              <input
                type="text"
                name="author"
                defaultValue={editItem?.author || ''}
                placeholder="Autor"
                required
              />
              <input
                type="text"
                name="company"
                defaultValue={editItem?.company || ''}
                placeholder="Empresa (opcional)"
              />
              <button type="submit" className="button">
                Salvar
              </button>
            </form>
          )}
          {modalType === 'blog' && (
            <form onSubmit={handleBlogSubmit}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                {editItem ? 'Editar Post' : 'Adicionar Post'}
              </h3>
              <input
                type="text"
                name="title"
                defaultValue={editItem?.title || ''}
                placeholder="Título"
                required
              />
              <textarea
                name="content"
                defaultValue={editItem?.content || ''}
                placeholder="Conteúdo"
                required
              />
              <input
                type="file"
                name="image"
                accept="image/*"
              />
              <button type="submit" className="button">
                Salvar
              </button>
            </form>
          )}
          {modalType === 'portfolio' && (
            <form onSubmit={handlePortfolioSubmit}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                {editItem ? 'Editar Item de Portfólio' : 'Adicionar Item de Portfólio'}
              </h3>
              <input
                type="text"
                name="title"
                defaultValue={editItem?.title || ''}
                placeholder="Título"
                required
              />
              <textarea
                name="description"
                defaultValue={editItem?.description || ''}
                placeholder="Descrição"
                required
              />
              <input
                type="file"
                name="file"
                accept="image/*"
              />
              <button type="submit" className="button">
                Salvar
              </button>
            </form>
          )}
        </Modal>

        {/* Seção Contato */}
        <section id="contato" className="section" style={{ background: '#F3F4F6' }}>
          <div className="container">
            <h2>Entre em Contato</h2>
            <p>
              Transforme sua ideia em um projeto digital de sucesso. Preencha o formulário ou fale conosco pelo WhatsApp!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSeWvZHZy87pAoIyGP3B3SevFCDag7xqoIpJxtxBtnTE7O4hPA/viewform"
                target="_blank"
                className="button orange"
              >
                Acessar Formulário
              </a>
            </div>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSeWvZHZy87pAoIyGP3B3SevFCDag7xqoIpJxtxBtnTE7O4hPA/viewform?embedded=true"
                width="100%"
                height="600"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                style={{ borderRadius: '12px' }}
              >
                Carregando...
              </iframe>
            </div>
          </div>
        </section>

        {/* Botão do WhatsApp */}
        <a
          href="https://wa.me/5561986221147?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20serviços%20da%20CPW."
          target="_blank"
          className="whatsapp-btn"
          aria-label="Fale conosco no WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.548 4.106 1.5 5.849L0 24l6.304-1.652A11.951 11.951 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.053c-1.913 0-3.695-.564-5.174-1.532l-.36-.212-3.736.981.999-3.65-.236-.377A9.954 9.954 0 012 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10zm5.794-6.432l-.797-.398a1.996 1.996 0 00-2.1.398-.4-.504-.504-.1-.008-.896-.1-.615-1.105-.606-.208-.606-.208-1.24.104-1.874-.104-1.27-.417-2.394-1.353-.3.31-2.51-.916-.1.156-.1.615-2.416-1.874-3.884-.26-1.468.104-2.936.916-.4.092-.416-.583-.896-.16.15-.896-.606-.06 0-1.212.208 1.615.624 l-.797 . l . l l . c-.416-.416-.416-.896-.0-1.312-.504-.504-1 l-. c-.208-.208-.312-.520-.208-.832-.208-.624-.520-.1.24-.916-.1.856-.396-.624-.916-.1.144-.1.615-1.456-.312-.104-.624-.0-.832-.208-.504-.504-.1 l-.416-.416-.416-.896-.0-.1 l-.312 l-.797 l . l l-. l-. . c-.416-.416-.416-.896-.0-1.312 z-1 z"/>
          </svg>
        </a>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <p>© 2025 Creattion Project Web. Todos os direitos reservados.</p>
            <p style={{ marginTop: '8px' }}>
              E-mail: <a href="mailto:creattionprojectweb@gmail.com">creattionprojectweb@gmail.com</a> | Telefone: 
              <a href="https://wa.me/5561986221147">+55 (61) 98622-1147</a>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
              <a href="https://instagram.com/cpw_web" target="_blank">Instagram</a>
              <a href="https://linkedin.com/company/cpw-web" target="_blank">LinkedIn</a>
              <a href="https://twitter.com/cpw_web" target="_blank">Twitter</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  console.log('Renderizando aplicação...');
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
  console.log('Aplicação renderizada com sucesso');
} catch (err) {
  console.error('Erro crítico na execução do script:', err.message, err.stack);
  document.getElementById('root').innerHTML = '<div class="error-message">Erro ao carregar a aplicação: ' + err.message + '. Consulte o console para mais detalhes.</div>';
}