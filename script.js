// Jhalani Portfolio JavaScript Controller

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------
  // 1. Initial Setup & Helpers
  // ----------------------------------------------------
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ----------------------------------------------------
  // 2. Custom Cursor & Trail
  // ----------------------------------------------------
  const cursor = document.getElementById('customCursor');
  const cursorTrail = document.getElementById('customCursorTrail');
  
  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;
  
  if (!isTouchDevice && cursor && cursorTrail) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    });
    
    // Smooth trail animation loop
    const animateTrail = () => {
      // Linear interpolation: trail moves 15% towards the mouse position every frame
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      
      cursorTrail.style.left = trailX + 'px';
      cursorTrail.style.top = trailY + 'px';
      
      requestAnimationFrame(animateTrail);
    };
    animateTrail();

    // Hover interactions for cursor
    const hoverables = document.querySelectorAll('a, button, .glow-card, .magnetic');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursor.style.backgroundColor = 'var(--accent-purple)';
        cursorTrail.style.transform = 'translate(-50%, -50%) scale(1.3)';
        cursorTrail.style.borderColor = 'var(--accent-cyan)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = 'var(--accent-cyan)';
        cursorTrail.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorTrail.style.borderColor = 'var(--accent-purple)';
      });
    });
  }

  // ----------------------------------------------------
  // 3. Dynamic Particle Canvas Background
  // ----------------------------------------------------
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  let particleCount = 70;
  let connectionDistance = 120;
  let mouse = { x: null, y: null, radius: 150 };

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Scale count based on screen width
    if (window.innerWidth < 768) {
      particleCount = 35;
      connectionDistance = 80;
    } else {
      particleCount = 75;
      connectionDistance = 120;
    }
    initParticles();
  };

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6; // Speed X
      this.vy = (Math.random() - 0.5) * 0.6; // Speed Y
      this.size = Math.random() * 2 + 1;
      this.color = Math.random() > 0.5 ? 'rgba(0, 245, 255, 0.4)' : 'rgba(161, 85, 255, 0.3)';
    }

    update() {
      // Standard boundary wrapping
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      
      // Mouse interaction (light repulsion)
      if (mouse.x !== null && mouse.y !== null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius;
          let angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 2;
          this.y += Math.sin(angle) * force * 2;
        }
      }

      this.x += this.vx;
      this.y += this.vy;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  const initParticles = () => {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  };

  const drawLines = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < connectionDistance) {
          let alpha = (1 - dist / connectionDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(161, 85, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  };

  const animateParticles = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Radial glow under particles
    let grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 10, canvas.width/2, canvas.height/2, canvas.width);
    grad.addColorStop(0, '#0a0d24');
    grad.addColorStop(1, '#030712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawLines();
    requestAnimationFrame(animateParticles);
  };

  // Mouse move tracks for canvas repulsion
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animateParticles();

  // ----------------------------------------------------
  // 4. Card Interactive Glow (Mouse coordinates mapped to CSS vars)
  // ----------------------------------------------------
  const cards = document.querySelectorAll('.glow-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ----------------------------------------------------
  // 5. Typing Text Animation (Hero Section Subtitle)
  // ----------------------------------------------------
  const typedTextSpan = document.getElementById('typed-text');
  const roles = [
    "Software Engineering Intern",
    "Full-Stack Developer",
    "Competitive Programmer",
    "AI Enthusiast"
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  const typeRole = () => {
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      typedTextSpan.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Deletes faster
    } else {
      typedTextSpan.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100; // Natural typing speed
    }

    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at full word
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(typeRole, typingSpeed);
  };
  
  if (typedTextSpan) {
    typeRole();
  }

  // ----------------------------------------------------
  // 6. Hacker Scramble Text Decoder Effect
  // ----------------------------------------------------
  const scrambleElements = document.querySelectorAll('.scramble-text');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-/\\';
  
  const scrambleText = (el) => {
    let iteration = 0;
    const originalText = el.dataset.value || el.innerText;
    // Set explicit data-value if missing
    if (!el.dataset.value) el.dataset.value = originalText;
    
    clearInterval(el.scrambleInterval);
    
    el.scrambleInterval = setInterval(() => {
      el.innerText = originalText
        .split("")
        .map((char, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          if (char === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      
      if (iteration >= originalText.length) {
        clearInterval(el.scrambleInterval);
      }
      
      iteration += 1 / 3;
    }, 30);
  };

  // Run on page load
  scrambleElements.forEach(el => scrambleText(el));
  
  // Also run on hover for section titles
  scrambleElements.forEach(el => {
    el.addEventListener('mouseenter', () => scrambleText(el));
  });

  // ----------------------------------------------------
  // 7. Navigation Control & Active Links Scroll Tracking
  // ----------------------------------------------------
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('header, section');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinksList = document.getElementById('navLinks');
  
  let lastScrollY = window.scrollY;

  // Sticky and Hide/Show Navbar on Scroll
  window.addEventListener('scroll', () => {
    // Fill Scroll Progress Bar
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalScroll) * 100;
    document.getElementById('scrollProgressBar').style.width = `${progress}%`;

    // Navbar toggle visibility based on scroll direction
    if (window.scrollY > 150) {
      if (window.scrollY > lastScrollY) {
        navbar.classList.add('scroll-down');
        navbar.classList.remove('scroll-up');
      } else {
        navbar.classList.add('scroll-up');
        navbar.classList.remove('scroll-down');
      }
    } else {
      navbar.classList.remove('scroll-down', 'scroll-up');
    }
    lastScrollY = window.scrollY;

    // Viewport-based Active Nav Highlight
    let currentActive = "";
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentActive = sec.getAttribute('id');
      }
    });

    if (currentActive) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentActive}`) {
          link.classList.add('active');
        }
      });
    }
  });

  // Mobile Nav Burger Menu Toggle
  if (mobileToggle && navLinksList) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinksList.classList.toggle('active');
    });

    // Close mobile nav when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinksList.classList.remove('active');
      });
    });
  }

  // ----------------------------------------------------
  // 8. Magnetic Buttons / Items Hover
  // ----------------------------------------------------
  const magneticItems = document.querySelectorAll('.magnetic');
  if (!isTouchDevice) {
    magneticItems.forEach(item => {
      item.addEventListener('mousemove', (e) => {
        const bound = item.getBoundingClientRect();
        // Mouse coordinates relative to target center
        const x = e.clientX - bound.left - (bound.width / 2);
        const y = e.clientY - bound.top - (bound.height / 2);
        
        // Push slightly
        item.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      
      item.addEventListener('mouseleave', () => {
        item.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // ----------------------------------------------------
  // 8b. Form Submission Handler (Integrated with Notification Service API)
  // ----------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.form-submit');
      const submitText = submitBtn.querySelector('span');
      const originalText = submitText.textContent;
      
      // Update UI to sending state
      submitText.textContent = "Sending...";
      submitBtn.style.opacity = "0.7";
      submitBtn.style.pointerEvents = "none";
      
      const payload = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim()
      };



      // Submit directly to your Google Sheet web app URL
      const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyfTufF4QXiG5Edx5esQNbbeJIYthPesbbwOH9GhhOoxttIYhBXSzWfeYd1KZz2eJPYtw/exec';
      
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors', // Avoids CORS errors when redirecting to script executions
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        showNotificationToast("Message sent to Google Sheet!");
        contactForm.reset();
      } catch (err) {
        console.error("Google Sheet submission error:", err);
        showNotificationToast("Failed to send message.", "error");
      } finally {
        submitText.textContent = originalText;
        submitBtn.style.opacity = "1";
        submitBtn.style.pointerEvents = "auto";
      }
    });
  }

  // Helper toast notification function
  function showNotificationToast(msg, type = "success") {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i>
        <span>${msg}</span>
      </div>
    `;
    
    // Style toast dynamically
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      background: 'rgba(15, 23, 42, 0.95)',
      border: `1.5px solid ${type === 'success' ? 'var(--accent-cyan)' : 'var(--accent-purple)'}`,
      color: 'var(--text-primary)',
      padding: '16px 24px',
      borderRadius: '12px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      zIndex: '10001',
      fontFamily: 'var(--font-header)',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      opacity: '0',
      transform: 'translateY(20px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease'
    });
    
    document.body.appendChild(toast);
    
    // Trigger animation frame
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 50);
    
    // Remove toast after delay
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // ----------------------------------------------------
  // 9. Intersection Observer for Scroll Reveals
  // ----------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        
        // If it's a skill category card, animate the skill bars inside it
        if (entry.target.classList.contains('skill-category-card')) {
          const bars = entry.target.querySelectorAll('.skill-bar-fill');
          bars.forEach(bar => {
            const p = bar.style.getPropertyValue('--percent');
            bar.style.width = p;
          });
        }
        
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  if (!('IntersectionObserver' in window)) {
    // Fallback: immediately reveal all
    revealElements.forEach(el => {
      el.classList.add('revealed');
      const bars = el.querySelectorAll('.skill-bar-fill');
      bars.forEach(bar => {
        const p = bar.style.getPropertyValue('--percent');
        bar.style.width = p;
      });
    });
  } else {
    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }

  // ----------------------------------------------------
  // 10. GSAP Animations (Safe & Decoupled)
  // ----------------------------------------------------
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    try {
      // Register scrolltrigger plugin
      gsap.registerPlugin(ScrollTrigger);

      // Initial Hero page entry sequence
      const tl = gsap.timeline();
      tl.from('.navbar', { y: -100, opacity: 0, duration: 0.8, ease: 'power4.out' })
        .from('.hero-badge', { scale: 0.8, opacity: 0, duration: 0.4, ease: 'back.out(1.7)' })
        .from('.hero-title', { y: 50, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2')
        .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.4, ease: 'power3.out' }, '-=0.2')
        .from('.hero-description', { y: 20, opacity: 0, duration: 0.4, ease: 'power3.out' }, '-=0.2')
        .from('.hero-ctas .btn', { y: 20, opacity: 0, duration: 0.4, ease: 'power3.out', stagger: 0.1 }, '-=0.2')
        .from('.social-links .social-icon', { scale: 0.8, opacity: 0, duration: 0.4, ease: 'back.out(1.5)', stagger: 0.08 }, '-=0.2')
        .from('.avatar-card', { x: 100, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.8');

      // Scroll reveal animations for section titles
      gsap.utils.toArray('section').forEach(section => {
        const title = section.querySelector('.section-title');
        const underline = section.querySelector('.section-underline');
        
        if (title && underline) {
          gsap.from([title, underline], {
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none none'
            },
            y: 20,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: 'power2.out'
          });
        }
      });

      // Stats counter animation
      const stats = document.querySelectorAll('.stat-num');
      stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        
        gsap.to(stat, {
          scrollTrigger: {
            trigger: stat,
            start: 'top 85%',
          },
          innerText: target,
          duration: 2,
          snap: { innerText: 1 },
          ease: 'power3.out'
        });
      });
    } catch (e) {
      console.warn("GSAP ScrollTrigger execution error:", e);
      fillAllBarsFallback();
    }
  } else {
    fillAllBarsFallback();
  }

  function fillAllBarsFallback() {
    // Immediate fallback for skill bars if GSAP fails
    const fills = document.querySelectorAll('.skill-bar-fill');
    fills.forEach(bar => {
      const p = bar.style.getPropertyValue('--percent');
      bar.style.width = p;
    });
  }

  // ----------------------------------------------------
  // Resume AI Chatbot Widget Logic (Re-integrated)
  // ----------------------------------------------------
  const chatbotContainer = document.getElementById('chatbotContainer');
  const chatbotLauncher = document.getElementById('chatbotLauncher');
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotClose = document.getElementById('chatbotClose');
  const chatbotClearHistory = document.getElementById('chatbotClearHistory');
  const chatbotMaximize = document.getElementById('chatbotMaximize');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const chatbotInputForm = document.getElementById('chatbotInputForm');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotSendBtn = document.getElementById('chatbotSendBtn');
  const chatOpenIcon = chatbotLauncher.querySelector('.chat-open-icon');
  const chatCloseIcon = chatbotLauncher.querySelector('.chat-close-icon');

  // Dynamic API routing (uses localhost for local dev, fallback for live backend hosting)
  const API_CHAT_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/chat'
    : 'https://portfolio-h1vj.onrender.com/chat';
  const STORAGE_KEY = 'aj_resume_chat_history';

  // Toggle Chat window
  const toggleChat = () => {
    const isActive = chatbotContainer.classList.toggle('active');
    if (isActive) {
      chatOpenIcon.style.display = 'none';
      chatCloseIcon.style.display = 'block';
      setTimeout(scrollToBottom, 100);
      chatbotInput.focus();
    } else {
      chatOpenIcon.style.display = 'block';
      chatCloseIcon.style.display = 'none';
    }
  };

  chatbotLauncher.addEventListener('click', toggleChat);
  
  if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
      chatbotContainer.classList.remove('active');
      chatOpenIcon.style.display = 'block';
      chatCloseIcon.style.display = 'none';
    });
  }

  // Maximize Window size toggle
  if (chatbotMaximize) {
    chatbotMaximize.addEventListener('click', () => {
      const isMaximized = chatbotWindow.classList.toggle('maximized');
      const maxIcon = chatbotMaximize.querySelector('i');
      if (isMaximized) {
        maxIcon.className = 'fa-solid fa-compress';
        chatbotMaximize.title = 'Restore Window';
      } else {
        maxIcon.className = 'fa-solid fa-expand';
        chatbotMaximize.title = 'Maximize Window';
      }
      setTimeout(scrollToBottom, 100);
    });
  }

  // Scroll to bottom helper
  const scrollToBottom = () => {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  };

  // Simple markdown to HTML formatter for bot messages
  const formatMarkdown = (text) => {
    if (!text) return '';
    
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Parse tables
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    const outputLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('|') && line.endsWith('|')) {
        if (line.match(/^\|[\s\-\:\|]+$/)) {
          continue; // skip divider
        }
        
        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        let rowHtml = '<tr>';
        
        if (!inTable) {
          inTable = true;
          tableHtml = '<div class="table-container"><table><thead><tr>';
          cells.forEach(cell => {
            tableHtml += `<th>${cell}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
          continue;
        } else {
          cells.forEach(cell => {
            rowHtml += `<td>${cell}</td>`;
          });
          rowHtml += '</tr>';
          tableHtml += rowHtml;
        }
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</tbody></table></div>';
          outputLines.push(tableHtml);
          tableHtml = '';
        }
        outputLines.push(lines[i]);
      }
    }
    
    if (inTable) {
      tableHtml += '</tbody></table></div>';
      outputLines.push(tableHtml);
    }

    html = outputLines.join('\n');

    // Bold formatting: **text** -> <strong>text</strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Bullet lists: - item -> <li>item</li>
    html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
    
    // Wrap consecutive list items in <ul>
    html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');

    // Replace newlines with <br>
    html = html.replace(/\n/g, '<br>');
    
    // Clean up br tags inside/around list and table tags
    html = html.replace(/<br>\s*<ul>/g, '<ul>');
    html = html.replace(/<\/ul>\s*<br>/g, '</ul>');
    html = html.replace(/<br>\s*<div class="table-container">/g, '<div class="table-container">');
    html = html.replace(/<\/div>\s*<br>/g, '</div>');
    html = html.replace(/<tr>\s*<br>/g, '<tr>');
    html = html.replace(/<\/tr>\s*<br>/g, '</tr>');

    return html;
  };

  // Append a message to the UI
  const appendMessage = (sender, text) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    if (sender === 'bot') {
      msgDiv.innerHTML = formatMarkdown(text);
    } else {
      const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      msgDiv.innerHTML = `<p>${escapedText}</p>`;
    }
    chatbotMessages.appendChild(msgDiv);
    scrollToBottom();
  };

  // Show/Hide typing indicator
  const showTypingIndicator = () => {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'chat-message bot typing-indicator-container';
    indicatorDiv.id = 'typingIndicator';
    indicatorDiv.innerHTML = `
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatbotMessages.appendChild(indicatorDiv);
    scrollToBottom();
  };

  const removeTypingIndicator = () => {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.remove();
    }
  };

  // Save chat to session storage
  const getHistory = () => {
    const history = sessionStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  };

  const saveMessageToHistory = (sender, text) => {
    const history = getHistory();
    history.push({ sender, text });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  };

  // Clear chat history
  const clearChatHistory = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    chatbotMessages.innerHTML = `
      <div class="chat-message bot">
        <p>Hi! I'm Avish's AI assistant. Ask me anything about his projects, skills, education, or work history!</p>
      </div>
    `;
  };

  if (chatbotClearHistory) {
    chatbotClearHistory.addEventListener('click', clearChatHistory);
  }

  // Initialize Chat History
  const initChat = () => {
    const history = getHistory();
    if (history.length > 0) {
      chatbotMessages.innerHTML = '';
      history.forEach(msg => appendMessage(msg.sender, msg.text));
    }
  };
  initChat();

  // Send message function
  const handleSendMessage = async (text) => {
    if (!text || text.trim() === '') return;
    const query = text.trim();

    appendMessage('user', query);
    saveMessageToHistory('user', query);
    chatbotInput.value = '';

    chatbotInput.disabled = true;
    chatbotSendBtn.disabled = true;

    showTypingIndicator();

    try {
      const response = await fetch(API_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: query })
      });

      const data = await response.json();
      removeTypingIndicator();

      if (data.answer) {
        appendMessage('bot', data.answer);
        saveMessageToHistory('bot', data.answer);
      } else if (data.error) {
        appendMessage('bot', `Error: ${data.error}`);
      } else {
        appendMessage('bot', "I couldn't process that response. Please try again.");
      }
    } catch (err) {
      console.error("Chatbot API error:", err);
      removeTypingIndicator();
      
      const q = query.toLowerCase();
      let fallbackAnswer = "";

      if (q.includes("powerpilot") || q.includes("power pilot") || q.includes("power bi") || q.includes("dax")) {
        fallbackAnswer = `**PowerPilot AI** is Avish's flagship autonomous agentic pipeline that ingests raw CSV/Parquet, cleans, models, and compiles Power BI dashboards end-to-end.\n\n` +
          `- **Live Demo**: [https://powerpilot-ai-y758.onrender.com/](https://powerpilot-ai-y758.onrender.com/)\n` +
          `- **GitHub Repo**: [github.com/avishjhalani/PowerPilot-AI](https://github.com/avishjhalani/PowerPilot-AI)\n` +
          `- **Speed & Scale**: Ingests 500,000+ records in 8.6s at <35MB peak RAM via DuckDB and Polars streaming.\n` +
          `- **LLM DAX Synthesizer**: Uses Groq LLM (gpt-oss-120b) to synthesize 6–8 production-grade DAX measures within a 4,000-char context budget.\n` +
          `- **Self-Healing Layer**: AST-based static analysis blocking unsafe calls with 3-attempt error recovery (zero unsafe executions).`;
      } else if (q.includes("project") || q.includes("built") || q.includes("work")) {
        fallbackAnswer = `Here are Avish's featured engineering projects:\n\n` +
          `1. **[PowerPilot AI](https://powerpilot-ai-y758.onrender.com/)**: Autonomous agentic Power BI dashboard generator compiling 500k+ rows in 8.6s with DuckDB, Polars, FastAPI, and Groq LLM.\n` +
          `2. **[Collab-Docs](https://collabdocs-ten.vercel.app/)**: Real-time collaborative workspace with Yjs CRDTs, WebSockets, and 98% reduced DB write overhead.\n` +
          `3. **[BloodLink](https://bloodlink1.vercel.app/)**: Full-stack donor matching platform using PostGIS spatial queries (10km radius) and 11-case E2E test suite.`;
      } else if (q.includes("skill") || q.includes("stack") || q.includes("technolog")) {
        fallbackAnswer = `**Avish's Technical Arsenal**:\n\n` +
          `- **Languages**: C++, JavaScript, Python, SQL\n` +
          `- **Web & Cloud**: FastAPI, Next.js, Node.js, Express.js, NestJS, Socket.io, RESTful APIs\n` +
          `- **Databases & Tools**: PostgreSQL, DuckDB, Polars, Redis, Prisma, Docker, Git, Postman`;
      } else if (q.includes("experience") || q.includes("intern")) {
        fallbackAnswer = `**Software Engineering Intern at Global AI Technologies** (Jan 2026 - June 2026):\n\n` +
          `- Analyzed 100,000+ e-commerce transactions using Python (Pandas, NumPy, Matplotlib) and MySQL.\n` +
          `- Applied Chi-square tests and proportion z-tests to isolate return drivers (COD orders: 84.4% return rate; size-mismatch: 37%).\n` +
          `- Built an interactive Power BI dashboard with operational recommendations projecting a 7–11% reduction in return rates.`;
      } else {
        fallbackAnswer = "The AI backend server is currently spinning up. In the meantime, you can explore Avish's flagship project **[PowerPilot AI](https://powerpilot-ai-y758.onrender.com/)**, test **[Collab-Docs](https://collabdocs-ten.vercel.app/)**, or review his technical skills above!";
      }

      appendMessage('bot', fallbackAnswer);
      saveMessageToHistory('bot', fallbackAnswer);
    } finally {
      chatbotInput.disabled = false;
      chatbotSendBtn.disabled = false;
      chatbotInput.focus();
    }
  };

  // Form Submit Listener
  if (chatbotInputForm) {
    chatbotInputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSendMessage(chatbotInput.value);
    });
  }

  // Suggestion Chips Click Handler
  const suggestionChips = document.querySelectorAll('.suggestion-chip');
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      handleSendMessage(chip.textContent);
    });
  });

});

