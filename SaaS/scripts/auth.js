// Verificar tipo de usuário
const userType = sessionStorage.getItem("userType")

if (!userType) {
  window.location.href = "selection.html"
}

// Mostrar campos específicos só pros comerciante
if (userType === "comerciante") {
  document.getElementById("comercianteFields").style.display = "block"
} else {
  document.getElementById("consumidorFields").style.display = "block"
}

// Alternar entre os fomulario
function switchTab(tab) {
  const tabs = document.querySelectorAll(".tab")
  const loginForm = document.getElementById("loginForm")
  const cadastroForm = document.getElementById("cadastroForm")

  tabs.forEach((t) => t.classList.remove("active"))

  if (tab === "login") {
    tabs[0].classList.add("active")
    loginForm.style.display = "flex"
    cadastroForm.style.display = "none"
    document.getElementById("authTitle").textContent = "Login"
  } else {
    tabs[1].classList.add("active")
    loginForm.style.display = "none"
    cadastroForm.style.display = "flex"
    document.getElementById("authTitle").textContent = "Cadastro"
  }
}

function previewFoto(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const preview = document.getElementById("fotoPreview")
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">`
    }
    reader.readAsDataURL(file)
  }
}

// Login
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  // Buscar usuário no localStorage
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const user = users.find((u) => u.email === email && u.senha === password && u.tipo === userType)

  if (user) {
    sessionStorage.setItem("currentUser", JSON.stringify(user))

    if (userType === "comerciante") {
      window.location.href = "comerciante/dashboard.html"
    } else {
      window.location.href = "consumidor/dashboard.html"
    }
  } else {
    alert("Email ou senha incorretos!")
  }
})

// Cadastro
document.getElementById("cadastroForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const userData = {
    id: Date.now(),
    tipo: userType,
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    telefone: document.getElementById("telefone").value,
    senha: document.getElementById("senha").value,
    fotoPerfil: null,
  }

  const fotoPreview = document.getElementById("fotoPreview").querySelector("img")
  if (fotoPreview) {
    userData.fotoPerfil = fotoPreview.src
  }

  // Se for comerciante, não mais armazena dados de comércio no cadastro
  // Dados do comércio serão preenchidos depois no perfil

  // Salvar no localStorage
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Verificar se u email já existe
  if (users.some((u) => u.email === userData.email)) {
    alert("Este email já está cadastrado!")
    return
  }

  users.push(userData)
  localStorage.setItem("users", JSON.stringify(users))

  // Fazer login direto dps do cadastro
  sessionStorage.setItem("currentUser", JSON.stringify(userData))

  if (userType === "comerciante") {
    window.location.href = "comerciante/dashboard.html"
  } else {
    window.location.href = "consumidor/dashboard.html"
  }
})

function goBack() {
  sessionStorage.removeItem("userType")
  window.location.href = "selection.html"
}
