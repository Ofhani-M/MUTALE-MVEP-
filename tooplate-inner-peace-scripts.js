/* Mutale Victim Empowerment - scripts (adapted from the Tooplate Inner Peace template) */

// Quick exit: open a neutral site and replace this page in the browser history
/*function quickExit() {
   try { window.open('https://www.google.com', '_blank', 'noopener'); } catch (e) {}
    window.location.replace('https://www.weather.com');
}*/

function toggleMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        const open = menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
}

// Tabs: pass the clicked button as the second argument
function showTab(tabName, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
    });
    const target = document.getElementById(tabName);
    if (target) target.classList.add('active');
    if (btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Pressing Esc anywhere triggers the quick exit
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') quickExit();
    });

    // Make the hamburger usable with a keyboard
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.setAttribute('role', 'button');
        menuToggle.setAttribute('tabindex', '0');
        menuToggle.setAttribute('aria-label', 'Open menu');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
    }

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const container = document.querySelector('.nav-links');
            if (menuToggle && container) {
                menuToggle.classList.remove('active');
                container.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Highlight the current section in the menu
    const sections = document.querySelectorAll('section');
    const menuLinks = document.querySelectorAll('.nav-link');
    if (sections.length && menuLinks.length) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                if (window.scrollY >= section.offsetTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            menuLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href && href.slice(1) === current) link.classList.add('active');
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Header shadow on scroll
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
            }
        });
    }

    // Timeline: highlight the step that matches the card being read
    const cards = document.querySelectorAll('.practice-card-new');
    const points = document.querySelectorAll('.timeline-point');
    if ('IntersectionObserver' in window && cards.length === points.length && cards.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const i = Array.from(cards).indexOf(entry.target);
                    points.forEach((p, idx) => p.classList.toggle('active', idx === i));
                }
            });
        }, { rootMargin: '-40% 0px -50% 0px' });
        cards.forEach(card => observer.observe(card));
    }

    // Contact form

    const form = document.querySelector('.contact-form form');
    
    if (form) {
        function showToast(message, type, duration = 3000) {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            container.appendChild(toast);

            requestAnimationFrame(() => toast.classList.add('show'));

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        form.addEventListener('submit', async e => {
            if (form.getAttribute('action')) return; // real endpoint set: submit normally
            e.preventDefault();
            const formData = new FormData(form);
            const email = String(formData.get('email') || '').trim();
            const phone = String(formData.get('phone') || '').trim();
            if (!email && !phone) {
                const phoneInput = form.elements.namedItem('phone');
                phoneInput.setCustomValidity('Enter an email address or phone number.');
                phoneInput.reportValidity();
                phoneInput.setCustomValidity('');
                showToast('Enter an email address or phone number.', 'error');
                return;
            }

            const data = {
                Name: formData.get('name') || '',
                Email: email,
                Subject: formData.get('subject') || '',
                Message: formData.get('message') || '',
                Phone: phone
            };
            console.log('Sending form data:', data);

            try {
                const response = await fetch('https://localhost:7247/api/ReachOut/CreateReachout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                console.log('Message submitted successfully.');
                showToast('Your message was sent successfully.', 'success');
                form.reset();
            } catch (error) {
                console.error('Submission failed:', error);
                showToast('We could not send your message. Please try again.', 'error');
            }
        });
    }
});
