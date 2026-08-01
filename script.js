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

});
