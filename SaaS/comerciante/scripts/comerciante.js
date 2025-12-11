const currentUser = JSON.parse(sessionStorage.getItem("currentUser"))

if (!currentUser || currentUser.tipo !== "comerciante") {
  window.location.href = "../index.html"
}

if (currentUser.fotoPerfil) {
  document.getElementById("sidebarProfilePic").src = currentUser.fotoPerfil
}

function navigateTo(page) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  if (document.querySelector(`[data-page="${page}"]`)) {
    document.querySelector(`[data-page="${page}"]`).classList.add("active")
  }

  document.querySelectorAll(".page").forEach((p) => {
    p.style.display = "none"
  })

  const pageMap = {
    inicio: "pageInicio",
    comercios: "pageComercios",
    produtos: "pageProdutos",
    pedidos: "pagePedidos",
    perfil: "pagePerfil",
  }

  document.getElementById(pageMap[page]).style.display = "block"

  if (page === "comercios") loadComercios()
  if (page === "produtos") loadProdutos()
  if (page === "pedidos") loadPedidos()
  if (page === "perfil") loadPerfil()
}

function logout() {
  if (confirm("Deseja realmente sair?")) {
    sessionStorage.removeItem("currentUser")
    window.location.href = "../index.html"
  }
}

function loadComercios() {
  const comercios = JSON.parse(localStorage.getItem("comercios") || "[]")
  const userComercios = comercios.filter((c) => c.userId === currentUser.id)
  const container = document.getElementById("comerciosList")

  if (userComercios.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Nenhum comércio cadastrado ainda.</p>'
    return
  }

  container.innerHTML = userComercios
    .map(
      (comercio) => `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${comercio.nome}</h3>
      </div>
      <p style="color: var(--text-secondary); margin-bottom: 0.5rem;"><strong>Categoria:</strong> ${comercio.categoria}</p>
      <p style="color: var(--text-secondary); margin-bottom: 0.5rem;"><strong>Endereço:</strong> ${comercio.endereco}</p>
      <p style="color: var(--text-secondary); margin-bottom: 0.5rem;"><strong>Telefone:</strong> ${comercio.telefone}</p>
      <p style="color: var(--text-secondary); margin-bottom: 1rem;">${comercio.descricao || ""}</p>
      <div class="product-actions">
        <button class="btn btn-primary btn-small" onclick="editComercio(${comercio.id})">Editar</button>
        <button class="btn btn-secondary btn-small" onclick="deleteComercio(${comercio.id})">Excluir</button>
      </div>
    </div>
  `,
    )
    .join("")
}

function openComercioModal(comercioId = null) {
  const modal = document.getElementById("comercioModal")
  modal.classList.add("active")

  if (comercioId) {
    const comercios = JSON.parse(localStorage.getItem("comercios") || "[]")
    const comercio = comercios.find((c) => c.id === comercioId)
    document.getElementById("comercioModalTitle").textContent = "Editar Comércio"
    document.getElementById("comercioId").value = comercio.id
    document.getElementById("comercioNome").value = comercio.nome
    document.getElementById("comercioCategoria").value = comercio.categoria
    document.getElementById("comercioEndereco").value = comercio.endereco
    document.getElementById("comercioTelefone").value = comercio.telefone
    document.getElementById("comercioDescricao").value = comercio.descricao || ""
  } else {
    document.getElementById("comercioModalTitle").textContent = "Cadastrar Comércio"
    document.getElementById("comercioForm").reset()
    document.getElementById("comercioId").value = ""
  }
}

function closeComercioModal() {
  document.getElementById("comercioModal").classList.remove("active")
  document.getElementById("comercioForm").reset()
}

function editComercio(id) {
  openComercioModal(id)
}

function deleteComercio(id) {
  if (confirm("Deseja realmente excluir este comércio?")) {
    let comercios = JSON.parse(localStorage.getItem("comercios") || "[]")
    comercios = comercios.filter((c) => c.id !== id)
    localStorage.setItem("comercios", JSON.stringify(comercios))
    loadComercios()
    loadDashboard()
  }
}

document.getElementById("comercioForm").addEventListener("submit", (e) => {
  e.preventDefault()

  console.log("[v0] Iniciando cadastro de comércio")

  const comercioId = document.getElementById("comercioId").value
  console.log("[v0] Comercio ID:", comercioId)

  const comercios = JSON.parse(localStorage.getItem("comercios") || "[]")
  console.log("[v0] Comércios atuais:", comercios)

  const comercioData = {
    id: comercioId ? Number.parseInt(comercioId) : Date.now(),
    userId: currentUser.id,
    nome: document.getElementById("comercioNome").value,
    categoria: document.getElementById("comercioCategoria").value,
    endereco: document.getElementById("comercioEndereco").value,
    telefone: document.getElementById("comercioTelefone").value,
    descricao: document.getElementById("comercioDescricao").value,
  }

  console.log("[v0] Dados do comércio:", comercioData)
  console.log("[v0] Current User:", currentUser)

  if (comercioId) {
    const index = comercios.findIndex((c) => c.id === Number.parseInt(comercioId))
    console.log("[v0] Editando comércio no índice:", index)
    comercios[index] = comercioData
  } else {
    console.log("[v0] Adicionando novo comércio")
    comercios.push(comercioData)
  }

  console.log("[v0] Salvando comércios:", comercios)
  localStorage.setItem("comercios", JSON.stringify(comercios))

  console.log("[v0] Fechando modal e recarregando listas")
  closeComercioModal()
  loadComercios()
  loadDashboard()
})

function loadDashboard() {
  const comercios = JSON.parse(localStorage.getItem("comercios") || "[]")
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")

  const userComercios = comercios.filter((c) => c.userId === currentUser.id)
  const userProdutos = produtos.filter((p) => p.userId === currentUser.id)
  const userPedidos = pedidos.filter((p) => p.comercianteId === currentUser.id && p.status === "pendente")

  document.getElementById("totalComercios").textContent = userComercios.length
  document.getElementById("totalProdutos").textContent = userProdutos.length
  document.getElementById("totalPedidos").textContent = userPedidos.length

  const ultimosPedidos = pedidos
    .filter((p) => p.comercianteId === currentUser.id)
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)
  const container = document.getElementById("ultimosPedidos")

  if (ultimosPedidos.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Nenhum pedido ainda.</p>'
  } else {
    container.innerHTML = ultimosPedidos
      .map((pedido) => {
        const produto = produtos.find((p) => p.id === pedido.produtoId)
        const badgeClass =
          pedido.status === "pendente"
            ? "badge-pending"
            : pedido.status === "finalizado"
              ? "badge-completed"
              : "badge-cancelled"
        return `<div style="padding: 1rem; border-bottom: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="font-weight: 600;">${produto ? produto.nome : "Produto removido"}</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Pedido #${pedido.id}</p>
          </div>
          <span class="badge ${badgeClass}">${pedido.status}</span>
        </div>
      </div>`
      })
      .join("")
  }
}

function loadProdutos() {
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
  const userProdutos = produtos.filter((p) => p.userId === currentUser.id)
  const container = document.getElementById("produtosList")

  if (userProdutos.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Nenhum produto cadastrado ainda.</p>'
    return
  }

  container.innerHTML = userProdutos
    .map(
      (produto) => `
    <div class="product-card">
      <img src="${produto.imagem || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2364748b'%3ESem Imagem%3C/text%3E%3C/svg%3E"}" class="product-image" alt="${produto.nome}">
      <div class="product-info">
        <h3 class="product-name">${produto.nome}</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">${produto.descricao || ""}</p>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem;">Estoque: ${produto.estoque} unidades</p>
        <p class="product-price">R$ ${Number.parseFloat(produto.preco).toFixed(2)}</p>
        <div class="product-actions">
          <button class="btn btn-primary btn-small" onclick="editProduto(${produto.id})">Editar</button>
          <button class="btn btn-secondary btn-small" onclick="deleteProduto(${produto.id})">Excluir</button>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

function openProdutoModal(produtoId = null) {
  const modal = document.getElementById("produtoModal")
  modal.classList.add("active")

  const comercios = JSON.parse(localStorage.getItem("comercios") || "[]")
  const userComercios = comercios.filter((c) => c.userId === currentUser.id)
  const selectComercio = document.getElementById("produtoComercio")
  selectComercio.innerHTML =
    '<option value="">Selecione um comércio...</option>' +
    userComercios.map((c) => `<option value="${c.id}">${c.nome}</option>`).join("")

  if (produtoId) {
    const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
    const produto = produtos.find((p) => p.id === produtoId)
    document.getElementById("produtoModalTitle").textContent = "Editar Produto"
    document.getElementById("produtoId").value = produto.id
    document.getElementById("produtoComercio").value = produto.comercioId
    document.getElementById("produtoNome").value = produto.nome
    document.getElementById("produtoDescricao").value = produto.descricao || ""
    document.getElementById("produtoPreco").value = produto.preco
    document.getElementById("produtoCategoria").value = produto.categoria
    document.getElementById("produtoEstoque").value = produto.estoque
    if (produto.imagem) {
      const preview = document.getElementById("imagePreview")
      preview.innerHTML = `<img src="${produto.imagem}" alt="Preview">`
    }
  } else {
    document.getElementById("produtoModalTitle").textContent = "Cadastrar Produto"
    document.getElementById("produtoForm").reset()
    document.getElementById("produtoId").value = ""
    document.getElementById("imagePreview").innerHTML =
      '<div class="image-placeholder"><p>Nenhuma imagem selecionada</p></div>'
  }
}

function closeProdutoModal() {
  document.getElementById("produtoModal").classList.remove("active")
  document.getElementById("produtoForm").reset()
}

function editProduto(id) {
  openProdutoModal(id)
}

function deleteProduto(id) {
  if (confirm("Deseja realmente excluir este produto?")) {
    let produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
    produtos = produtos.filter((p) => p.id !== id)
    localStorage.setItem("produtos", JSON.stringify(produtos))
    loadProdutos()
    loadDashboard()
  }
}

function previewImage(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const preview = document.getElementById("imagePreview")
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`
    }
    reader.readAsDataURL(file)
  }
}

document.getElementById("produtoForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const comercioId = document.getElementById("produtoComercio").value
  if (!comercioId) {
    alert("Por favor, selecione um comércio!")
    return
  }

  const produtoId = document.getElementById("produtoId").value
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
  let imagemBase64 = null
  const imagePreview = document.getElementById("imagePreview").querySelector("img")
  if (imagePreview) {
    imagemBase64 = imagePreview.src
  }

  const produtoData = {
    id: produtoId ? Number.parseInt(produtoId) : Date.now(),
    userId: currentUser.id,
    comercioId: Number.parseInt(comercioId),
    nome: document.getElementById("produtoNome").value,
    descricao: document.getElementById("produtoDescricao").value,
    preco: Number.parseFloat(document.getElementById("produtoPreco").value),
    categoria: document.getElementById("produtoCategoria").value,
    estoque: Number.parseInt(document.getElementById("produtoEstoque").value),
    imagem: imagemBase64,
  }

  if (produtoId) {
    const index = produtos.findIndex((p) => p.id === Number.parseInt(produtoId))
    produtos[index] = produtoData
  } else {
    produtos.push(produtoData)
  }

  localStorage.setItem("produtos", JSON.stringify(produtos))
  closeProdutoModal()
  loadProdutos()
  loadDashboard()
  alert("Produto salvo com sucesso!")
})

function loadPedidos() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const userPedidos = pedidos.filter((p) => p.comercianteId === currentUser.id)
  const container = document.getElementById("pedidosList")

  if (userPedidos.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Nenhum pedido ainda.</p>'
    return
  }

  container.innerHTML = userPedidos
    .map((pedido) => {
      const produto = produtos.find((p) => p.id === pedido.produtoId)
      const consumidor = users.find((u) => u.id === pedido.consumidorId)
      const badgeClass =
        pedido.status === "pendente"
          ? "badge-pending"
          : pedido.status === "finalizado"
            ? "badge-completed"
            : "badge-cancelled"

      return `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Pedido #${pedido.id}</h3>
            <span class="badge ${badgeClass}">${pedido.status}</span>
          </div>
        </div>
        <div style="margin-top: 1rem;">
          <p style="margin-bottom: 0.5rem;"><strong>Produto:</strong> ${produto ? produto.nome : "Produto removido"}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Cliente:</strong> ${consumidor ? consumidor.nome : "Desconhecido"}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Telefone:</strong> ${consumidor ? consumidor.telefone : "-"}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Endereço de Entrega:</strong> ${pedido.endereco}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Valor:</strong> R$ ${Number.parseFloat(pedido.valor).toFixed(2)}</p>
          ${pedido.observacoes ? `<p style="margin-bottom: 0.5rem;"><strong>Observações:</strong> ${pedido.observacoes}</p>` : ""}
          ${
            pedido.status === "pendente"
              ? `
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
              <button class="btn btn-primary btn-small" onclick="finalizarPedido(${pedido.id})">Finalizar Pedido</button>
              <button class="btn btn-secondary btn-small" onclick="cancelarPedido(${pedido.id})">Cancelar</button>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `
    })
    .join("")
}

function finalizarPedido(pedidoId) {
  if (confirm("Confirmar finalização do pedido?")) {
    const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")
    const pedido = pedidos.find((p) => p.id === pedidoId)
    if (pedido) {
      pedido.status = "finalizado"
      localStorage.setItem("pedidos", JSON.stringify(pedidos))
      enviarWhatsApp(pedido)
      loadPedidos()
      loadDashboard()
      alert("Pedido finalizado com sucesso! O cliente receberá uma notificação no WhatsApp.")
    }
  }
}

function cancelarPedido(pedidoId) {
  if (confirm("Deseja realmente cancelar este pedido?")) {
    const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")
    const pedido = pedidos.find((p) => p.id === pedidoId)
    if (pedido) {
      pedido.status = "cancelado"
      localStorage.setItem("pedidos", JSON.stringify(pedidos))
      loadPedidos()
      loadDashboard()
    }
  }
}

function enviarWhatsApp(pedido) {
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
  const comercios = JSON.parse(localStorage.getItem("comercios") || "[]")
  const consumidor = users.find((u) => u.id === pedido.consumidorId)
  const produto = produtos.find((p) => p.id === pedido.produtoId)
  const comercio = comercios.find((c) => c.userId === currentUser.id)

  if (!consumidor || !consumidor.telefone) {
    console.error("Telefone do consumidor não encontrado")
    return
  }

  let telefone = consumidor.telefone.replace(/\D/g, "")
  if (!telefone.startsWith("55")) {
    telefone = "55" + telefone
  }

  const mensagem = `*Pedido Finalizado!* OK\n\nOla ${consumidor.nome}!\n\nSeu pedido foi finalizado com sucesso!\n\n*Detalhes do Pedido:*\nProduto: ${produto ? produto.nome : "N/A"}\nComercio: ${comercio ? comercio.nome : "N/A"}\nValor: R$ ${Number.parseFloat(pedido.valor).toFixed(2)}\nEndereco: ${pedido.endereco}\nData: ${pedido.dataPedido || new Date().toLocaleString("pt-BR")}\n\nObrigado pela sua preferencia!`
  const mensagemCodificada = encodeURIComponent(mensagem)
  const urlWhatsApp = `https://wa.me/${telefone}?text=${mensagemCodificada}`
  window.open(urlWhatsApp, "_blank")
}

function limparTodosPedidos() {
  if (confirm("Deseja realmente limpar TODOS os pedidos? Esta ação não pode ser desfeita!")) {
    let pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")
    pedidos = pedidos.filter((p) => p.comercianteId !== currentUser.id)
    localStorage.setItem("pedidos", JSON.stringify(pedidos))
    loadPedidos()
    loadDashboard()
    alert("Todos os seus pedidos foram limpos!")
  }
}

function loadPerfil() {
  document.getElementById("perfilNome").value = currentUser.nome
  document.getElementById("perfilEmail").value = currentUser.email
  document.getElementById("perfilTelefone").value = currentUser.telefone
  document.getElementById("perfilSenha").value = ""

  if (currentUser.fotoPerfil) {
    const preview = document.getElementById("perfilFotoPreview")
    preview.innerHTML =
      '<img src="' +
      currentUser.fotoPerfil +
      '" alt="Preview" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;">'
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

  users[userIndex].nome = document.getElementById("perfilNome").value
  users[userIndex].email = document.getElementById("perfilEmail").value
  users[userIndex].telefone = document.getElementById("perfilTelefone").value

  const fotoPreview = document.getElementById("perfilFotoPreview").querySelector("img")
  if (fotoPreview) {
    users[userIndex].fotoPerfil = fotoPreview.src
  }

  const novaSenha = document.getElementById("perfilSenha").value
  if (novaSenha) {
    users[userIndex].senha = novaSenha
  }

  localStorage.setItem("users", JSON.stringify(users))
  currentUser.nome = users[userIndex].nome
  currentUser.email = users[userIndex].email
  currentUser.telefone = users[userIndex].telefone
  currentUser.fotoPerfil = users[userIndex].fotoPerfil
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser))
  alert("Perfil atualizado com sucesso!")
})

function previewPerfilFoto(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const preview = document.getElementById("perfilFotoPreview")
      preview.innerHTML =
        '<img src="' +
        e.target.result +
        '" alt="Preview" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;">'
    }
    reader.readAsDataURL(file)
  }
}

function deleteProfile() {
  const msg1 =
    "Tem certeza que deseja DELETAR SUA CONTA? Esta acao eh IRREVERSIVEL e todos os seus dados serao removidos?"
  if (confirm(msg1)) {
    const msg2 = "Confirme novamente: todos os seus dados, comercios, produtos e pedidos serao deletados!"
    if (confirm(msg2)) {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const comercios = JSON.parse(localStorage.getItem("comercios") || "[]")
      const produtos = JSON.parse(localStorage.getItem("produtos") || "[]")
      const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")

      const updatedUsers = users.filter((u) => u.id !== currentUser.id)
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      const updatedComercios = comercios.filter((c) => c.userId !== currentUser.id)
      localStorage.setItem("comercios", JSON.stringify(updatedComercios))

      const updatedProdutos = produtos.filter((p) => p.userId !== currentUser.id)
      localStorage.setItem("produtos", JSON.stringify(updatedProdutos))

      const updatedPedidos = pedidos.filter((p) => p.comercianteId !== currentUser.id)
      localStorage.setItem("pedidos", JSON.stringify(updatedPedidos))

      sessionStorage.removeItem("currentUser")
      alert("Sua conta foi deletada com sucesso.")
      window.location.href = "../index.html"
    }
  }
}

document.getElementById("perfilFotoInput").addEventListener("change", previewPerfilFoto)

loadDashboard()
