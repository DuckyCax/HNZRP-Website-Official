(() => {
  "use strict";
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  const dropdown = document.querySelector(".nav-dropdown");
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const progress = document.getElementById("progressBar");
  const backTop = document.getElementById("backToTop");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.addEventListener("load", () => document.getElementById("loader")?.classList.add("hidden"));
  setTimeout(() => document.getElementById("loader")?.classList.add("hidden"), 3000);

  menuToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menuToggle.querySelector("i").className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  });

  dropdownToggle?.addEventListener("click", () => {
    const open = dropdown.classList.toggle("open");
    dropdownToggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (!dropdown?.contains(event.target)) {
      dropdown?.classList.remove("open");
      dropdownToggle?.setAttribute("aria-expanded", "false");
    }
    if (innerWidth <= 1020 && !nav?.contains(event.target) && !menuToggle?.contains(event.target)) {
      nav?.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
      const icon = menuToggle?.querySelector("i");
      if (icon) icon.className = "fa-solid fa-bars";
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener("click", event => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({behavior: reducedMotion ? "auto" : "smooth"});
    nav?.classList.remove("open");
  }));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold: .12});
  document.querySelectorAll(".reveal").forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(el);
  });

  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      if (reducedMotion) { el.textContent = target.toLocaleString() + suffix; return; }
      const start = performance.now();
      const duration = 1500;
      const step = now => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counterObserver.unobserve(el);
    });
  }, {threshold:.5});
  counters.forEach(el => counterObserver.observe(el));

  const updateScroll = () => {
    const y = scrollY;
    header?.classList.toggle("scrolled", y > 30);
    backTop?.classList.toggle("show", y > 550);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  };
  addEventListener("scroll", updateScroll, {passive:true});
  updateScroll();
  backTop?.addEventListener("click", () => scrollTo({top:0, behavior:reducedMotion ? "auto" : "smooth"}));
  document.getElementById("year").textContent = new Date().getFullYear();
})();
