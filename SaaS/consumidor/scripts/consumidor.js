// Verificar autenticação
const currentUser = JSON.parse(sessionStorage.getItem("currentUser"))

if (!currentUser || currentUser.tipo !== "consumidor") {
  window.location.href = "../index.html"
}

// verificar a foto de perfil
if (currentUser.fotoPerfil) {
  const profilePic = document.getElementById("sidebarProfilePic")
  if (profilePic) {
    profilePic.src = currentUser.fotoPerfil
  }
}

// Navegação
function navigateTo(page) {
  // Remover active de todos os nav-items
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  // Adicionar active no item clicado - apenas se não for clique na foto de perfil
  if (document.querySelector(`[data-page="${page}"]`)) {
    document.querySelector(`[data-page="${page}"]`).classList.add("active")
  }

  // Esconder todas as páginas
  document.querySelectorAll(".page").forEach((p) => {
    p.style.display = "none"
  })

  // Mostrar página selecionada
  const pageMap = {
    produtos: "pageProdutos",
    pedidos: "pagePedidos",
    perfil: "pagePerfil",
  }

  document.getElementById(pageMap[page]).style.display = "block"

  // Carregar dados da página
  if (page === "produtos") loadProdutos()
  if (page === "pedidos") loadPedidos()
  if (page === "perfil") loadPerfil()
}

// Logout
function logout() {
  if (confirm("Deseja realmente sair?")) {
    sessionStorage.removeItem("currentUser")
    window.location.href = "../index.html"
  }
}

// produtos

function loadProdutos() {
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
  const comercios = JSON.parse(localStorage.getItem("comercios") || "[]")
  const filtroCategoria = document.getElementById("filtroCategoria").value

  // Filtrar produtos com estoque e pela categoria selecionada
  let produtosFiltrados = produtos.filter((p) => p.estoque > 0)

  if (filtroCategoria) {
    produtosFiltrados = produtosFiltrados.filter((p) => p.categoria === filtroCategoria)
  }

  const container = document.getElementById("produtosList")

  if (produtosFiltrados.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Nenhum produto disponível no momento.</p>'
    return
  }

  container.innerHTML = produtosFiltrados
    .map((produto) => {
      const comercio = comercios.find((c) => c.id === produto.comercioId)

      return `
            <div class="product-card">
                <img src="${produto.imagem || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2364748b'%3ESem Imagem%3C/text%3E%3C/svg%3E"}" 
                     class="product-image" alt="${produto.nome}">
                <div class="product-info">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${comercio ? comercio.nome : "Comércio"}</p>
                    <h3 class="product-name">${produto.nome}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">${produto.descricao || ""}</p>
                    <p style="color: var(--success); font-size: 0.85rem; margin-bottom: 0.5rem; font-weight: 600;">${produto.estoque} unidades disponíveis</p>
                    <p class="product-price">R$ ${Number.parseFloat(produto.preco).toFixed(2)}</p>
                    <button class="btn btn-primary" style="width: 100%;" onclick="abrirPedidoModal(${produto.id})">Fazer Pedido</button>
                </div>
            </div>
        `
    })
    .join("")
}

function abrirPedidoModal(produtoId) {
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
  const comercios = JSON.parse(localStorage.getItem("comercios") || "[]")
  const produto = produtos.find((p) => p.id === produtoId)

  if (!produto) {
    alert("Produto não encontrado!")
    return
  }

  const comercio = comercios.find((c) => c.id === produto.comercioId)

  // Preencher detalhes do produto
  document.getElementById("produtoDetalhes").innerHTML = `
        <div style="display: flex; gap: 1rem; padding: 1rem; background: var(--background); border-radius: 8px;">
            <img src="${produto.imagem || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23e2e8f0'/%3E%3C/svg%3E"}" 
                 style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" alt="${produto.nome}">
            <div style="flex: 1;">
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${comercio ? comercio.nome : "Comércio"}</p>
                <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">${produto.nome}</h3>
                <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">R$ ${Number.parseFloat(produto.preco).toFixed(2)}</p>
            </div>
        </div>
    `

  // Preencher campos
  document.getElementById("produtoId").value = produto.id
  document.getElementById("comercianteId").value = produto.userId
  document.getElementById("valorProduto").value = produto.preco
  document.getElementById("valorTotal").textContent = `R$ ${Number.parseFloat(produto.preco).toFixed(2)}`

  // Limpar formulário
  document.getElementById("enderecoEntrega").value = ""
  document.getElementById("pontoReferencia").value = ""
  document.getElementById("observacoes").value = ""

  // Abrir modal
  document.getElementById("pedidoModal").classList.add("active")
}

function closePedidoModal() {
  document.getElementById("pedidoModal").classList.remove("active")
  document.getElementById("pedidoForm").reset()
}

// Salva pedido
document.getElementById("pedidoForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const produtoId = Number.parseInt(document.getElementById("produtoId").value)
  const comercianteId = Number.parseInt(document.getElementById("comercianteId").value)
  const valor = Number.parseFloat(document.getElementById("valorProduto").value)
  const endereco = document.getElementById("enderecoEntrega").value
  const pontoReferencia = document.getElementById("pontoReferencia").value
  const observacoes = document.getElementById("observacoes").value

  // Verificar estoque
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
  const produto = produtos.find((p) => p.id === produtoId)

  if (!produto || produto.estoque <= 0) {
    alert("Produto sem estoque!")
    return
  }

  // Criar pedido
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")

  const novoPedido = {
    id: Date.now(),
    produtoId: produtoId,
    consumidorId: currentUser.id,
    comercianteId: comercianteId,
    endereco: endereco + (pontoReferencia ? ` - Ref: ${pontoReferencia}` : ""),
    observacoes: observacoes,
    valor: valor,
    status: "pendente",
    dataPedido: new Date().toLocaleString("pt-BR"),
  }

  pedidos.push(novoPedido)
  localStorage.setItem("pedidos", JSON.stringify(pedidos))

  // Atualizar estoque
  produto.estoque -= 1
  localStorage.setItem("produtos", JSON.stringify(produtos))

  closePedidoModal()
  loadProdutos()

  alert('Pedido realizado com sucesso! Acompanhe o status na aba "Meus Pedidos".')
})

// pedidos

function loadPedidos() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
  const comercios = JSON.parse(localStorage.getItem("comercios") || "[]")

  const meusPedidos = pedidos.filter((p) => p.consumidorId === currentUser.id).sort((a, b) => b.id - a.id)

  const container = document.getElementById("pedidosList")

  if (meusPedidos.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Você ainda não fez nenhum pedido.</p>'
    return
  }

  container.innerHTML = meusPedidos
    .map((pedido) => {
      const produto = produtos.find((p) => p.id === pedido.produtoId)
      const comercio = comercios.find((c) => c.id === (produto ? produto.comercioId : null))
      const badgeClass =
        pedido.status === "pendente"
          ? "badge-pending"
          : pedido.status === "finalizado"
            ? "badge-completed"
            : "badge-cancelled"

      return `
            <div class="card">
                <div class="card-header">
                    <div style="display: flex; justify-content: space-between; align-items: start; width: 100%;">
                        <div>
                            <h3 class="card-title">Pedido #${pedido.id}</h3>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">${pedido.dataPedido}</p>
                        </div>
                        <span class="badge ${badgeClass}">${pedido.status}</span>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                    ${
                      produto && produto.imagem
                        ? `
                        <img src="${produto.imagem}" 
                             style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" 
                             alt="${produto.nome}">
                    `
                        : ""
                    }
                    <div style="flex: 1;">
                        <p style="margin-bottom: 0.5rem;"><strong>Produto:</strong> ${produto ? produto.nome : "Produto removido"}</p>
                        <p style="margin-bottom: 0.5rem;"><strong>Comércio:</strong> ${comercio ? comercio.nome : "Não identificado"}</p>
                        <p style="margin-bottom: 0.5rem;"><strong>Endereço de Entrega:</strong> ${pedido.endereco}</p>
                        ${pedido.observacoes ? `<p style="margin-bottom: 0.5rem;"><strong>Observações:</strong> ${pedido.observacoes}</p>` : ""}
                        <p style="margin-top: 1rem; font-size: 1.25rem; font-weight: 700; color: var(--primary);">R$ ${Number.parseFloat(pedido.valor).toFixed(2)}</p>
                    </div>
                </div>
                
                ${
                  pedido.status === "finalizado"
                    ? `
                    <div style="margin-top: 1rem; padding: 1rem; background: var(--background); border-radius: 8px;">
                        <p style="color: var(--success); font-weight: 600; text-align: center;">Pedido Finalizado! Obrigado pela sua compra.</p>
                    </div>
                `
                    : pedido.status === "pendente"
                      ? `
                    <div style="margin-top: 1rem; padding: 1rem; background: var(--background); border-radius: 8px;">
                        <p style="color: var(--warning); font-weight: 600; text-align: center;">Aguardando confirmação do comerciante...</p>
                    </div>
                `
                      : ""
                }
            </div>
        `
    })
    .join("")
}

// Função do botao para limpar todos os pedidos
function limparTodosPedidos() {
  if (confirm("Deseja realmente limpar TODOS os seus pedidos? Esta ação não pode ser desfeita!")) {
    let pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")
    // Manter apenas pedidos de outros consumidores
    pedidos = pedidos.filter((p) => p.consumidorId !== currentUser.id)
    localStorage.setItem("pedidos", JSON.stringify(pedidos))
    loadPedidos()
    alert("Todos os seus pedidos foram limpos!")
  }
}

// perfil

function loadPerfil() {
  document.getElementById("perfilNome").value = currentUser.nome
  document.getElementById("perfilEmail").value = currentUser.email
  document.getElementById("perfilTelefone").value = currentUser.telefone
  document.getElementById("perfilSenha").value = ""

  if (currentUser.fotoPerfil) {
    const preview = document.getElementById("perfilFotoPreview")
    preview.innerHTML = `<img src="${currentUser.fotoPerfil}" alt="Preview" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;">`
  }
}

document.getElementById("perfilForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const userIndex = users.findIndex((u) => u.id === currentUser.id)

  if (userIndex === -1) {
    alert("Erro ao atualizar perfil!")
    return
  }

  // Atualizar dados do usuário
  users[userIndex].nome = document.getElementById("perfilNome").value
  users[userIndex].email = document.getElementById("perfilEmail").value
  users[userIndex].telefone = document.getElementById("perfilTelefone").value

  const fotoPreview = document.getElementById("perfilFotoPreview").querySelector("img")
  if (fotoPreview) {
    users[userIndex].fotoPerfil = fotoPreview.src
  }

  // Atualizar senha se fornecida
  const novaSenha = document.getElementById("perfilSenha").value
  if (novaSenha) {
    users[userIndex].senha = novaSenha
  }

  localStorage.setItem("users", JSON.stringify(users))

  // Atualizar sessão
  currentUser.nome = users[userIndex].nome
  currentUser.email = users[userIndex].email
  currentUser.telefone = users[userIndex].telefone
  currentUser.fotoPerfil = users[userIndex].fotoPerfil

  sessionStorage.setItem("currentUser", JSON.stringify(currentUser))

  alert("Perfil atualizado com sucesso!")
})

document.getElementById("perfilFotoInput").addEventListener("change", previewPerfilFoto)

function previewPerfilFoto(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const preview = document.getElementById("perfilFotoPreview")
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;">`
    }
    reader.readAsDataURL(file)
  }
}

function deleteProfile() {
  if (
    confirm("Tem certeza que deseja DELETAR SUA CONTA? Esta ação é IRREVERSÍVEL e todos os seus dados serão removidos.")
  ) {
    if (confirm("Confirme novamente: todos os seus pedidos e dados pessoais serão deletados!")) {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")

      // Remover usuário
      const updatedUsers = users.filter((u) => u.id !== currentUser.id)
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      // Remover pedidos do consumidor
      const updatedPedidos = pedidos.filter((p) => p.consumidorId !== currentUser.id)
      localStorage.setItem("pedidos", JSON.stringify(updatedPedidos))

      // Logout
      sessionStorage.removeItem("currentUser")
      alert("Sua conta foi deletada com sucesso.")
      window.location.href = "../index.html"
    }
  }
}

// Carregar produtos ao iniciar
loadProdutos()
