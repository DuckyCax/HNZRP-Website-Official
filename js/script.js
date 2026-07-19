/* ==========================================================
   HNZRP WEBSITE
   CLEAN + OPTIMIZED SCRIPT
========================================================== */

(function () {
    "use strict";

    const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const EDIT_STORAGE_KEY = `hnzrp_site_edits_v2:${location.pathname}`;

    document.addEventListener("DOMContentLoaded", () => {
        initEditMode();
        initNavbarState();
        initDepartmentFilter();
        initCardReveal();
        initSmoothScroll();
        initActiveNav();
        initStatCounters();
        initHeroParallax();
        detectDepartmentImages();
    });

    function initEditMode() {
        const controls = document.createElement("div");
        controls.className = "edit-controls";

        const editButton = document.createElement("button");
        editButton.className = "edit-toggle";
        editButton.textContent = "Edit Mode";

        const saveButton = document.createElement("button");
        saveButton.className = "edit-save";
        saveButton.textContent = "Save Changes";

        controls.append(editButton, saveButton);
        document.body.appendChild(controls);

        let editMode = false;
        const editableSelectors = "h1, h2, h3, p, span";
        const editableMap = new Map();

        restoreSavedEdits();

        editButton.addEventListener("click", () => {
            editMode = !editMode;

            if (editMode) {
                editButton.textContent = "Exit Edit";
                editButton.style.background = "#2bbb53";
                saveButton.style.display = "inline-flex";
                enableEditing();
            } else {
                editButton.textContent = "Edit Mode";
                editButton.style.background = "#f18d2f";
                saveButton.style.display = "none";
                disableEditing();
            }
        });

        saveButton.addEventListener("click", () => {
            const edits = {};
            editableMap.forEach((el, selector) => {
                edits[selector] = el.textContent;
            });
            localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(edits));

            const originalLabel = saveButton.textContent;
            saveButton.textContent = "Saved";
            saveButton.style.background = "#209545";

            window.setTimeout(() => {
                saveButton.textContent = originalLabel;
                saveButton.style.background = "#2bbb53";
            }, 1200);
        });

        function restoreSavedEdits() {
            const raw = localStorage.getItem(EDIT_STORAGE_KEY);
            if (!raw) {
                return;
            }

            try {
                const saved = JSON.parse(raw);
                Object.entries(saved).forEach(([selector, value]) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.textContent = value;
                    }
                });
            } catch (err) {
                console.error("Failed to restore saved edits", err);
            }
        }

        function enableEditing() {
            document.querySelectorAll(editableSelectors).forEach((el) => {
                if (shouldSkipEditable(el)) {
                    return;
                }

                const selector = generateSelector(el);
                editableMap.set(selector, el);
                el.classList.add("editable-active");
                el.addEventListener("click", makeEditable);
            });
        }

        function disableEditing() {
            editableMap.forEach((el) => {
                el.classList.remove("editable-active");
                el.removeEventListener("click", makeEditable);
            });
        }

        function shouldSkipEditable(el) {
            return (
                el.closest(".logo") ||
                el.closest(".nav-links") ||
                el.closest(".discord-button") ||
                el.closest("button") ||
                el.closest("footer") ||
                el.closest(".edit-controls")
            );
        }

        function makeEditable(event) {
            event.preventDefault();
            event.stopPropagation();

            const current = event.currentTarget;
            const selector = generateSelector(current);
            const originalText = current.textContent;

            const input = document.createElement("textarea");
            const computed = window.getComputedStyle(current);
            input.value = originalText;
            input.style.width = "100%";
            input.style.minHeight = "44px";
            input.style.padding = "10px";
            input.style.borderRadius = "8px";
            input.style.border = "2px solid #2ea4ff";
            input.style.background = "#0d1a27";
            input.style.color = "#eef6ff";
            input.style.fontFamily = computed.fontFamily;
            input.style.fontSize = computed.fontSize;
            input.style.fontWeight = computed.fontWeight;
            input.style.lineHeight = computed.lineHeight;
            input.style.resize = "vertical";

            current.replaceWith(input);
            input.focus();
            input.select();

            const saveEdit = () => {
                const nextText = input.value.trim() || originalText;
                current.textContent = nextText;
                input.replaceWith(current);
                current.classList.add("editable-active");
                current.addEventListener("click", makeEditable);
                editableMap.set(selector, current);
            };

            input.addEventListener("blur", saveEdit, { once: true });
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    saveEdit();
                }
            });
        }
    }

    function initNavbarState() {
        const navbar = document.querySelector(".navbar");
        if (!navbar) {
            return;
        }

        const update = () => {
            navbar.classList.toggle("scrolled", window.scrollY > 16);
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    function initDepartmentFilter() {
        const searchInput = document.getElementById("search");
        const filterSelect = document.getElementById("filter");
        const cards = document.querySelectorAll(".department-card");

        if (!searchInput || !filterSelect || cards.length === 0) {
            return;
        }

        const update = () => {
            const search = searchInput.value.trim().toLowerCase();
            const filter = filterSelect.value;

            cards.forEach((card) => {
                const title = card.querySelector("h2")?.textContent.toLowerCase() || "";
                const category = card.dataset.category || "";
                const visible = title.includes(search) && (filter === "all" || filter === category);
                card.style.display = visible ? "flex" : "none";
            });
        };

        searchInput.addEventListener("input", update);
        filterSelect.addEventListener("change", update);
    }

    function initCardReveal() {
        const cards = document.querySelectorAll(".department-card");
        if (cards.length === 0) {
            return;
        }

        if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
            cards.forEach((card) => card.classList.add("show"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.18 }
        );

        cards.forEach((card) => observer.observe(card));
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", (e) => {
                const href = anchor.getAttribute("href");
                if (!href || href === "#") {
                    return;
                }

                const target = document.querySelector(href);
                if (!target) {
                    return;
                }

                e.preventDefault();
                target.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth", block: "start" });
            });
        });
    }

    function initActiveNav() {
        const sections = document.querySelectorAll("section[id]");
        const navLinks = document.querySelectorAll(".nav-links a[href^='#']");

        if (sections.length === 0 || navLinks.length === 0) {
            return;
        }

        const update = () => {
            let current = "";
            sections.forEach((section) => {
                const top = section.offsetTop - 140;
                if (window.scrollY >= top) {
                    current = section.id;
                }
            });

            navLinks.forEach((link) => {
                const isActive = link.getAttribute("href") === `#${current}`;
                link.classList.toggle("active", isActive);
            });
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    function initStatCounters() {
        const counters = document.querySelectorAll(".stat h2");
        if (counters.length === 0) {
            return;
        }

        const animateCounter = (counter) => {
            const original = counter.textContent || "";
            const parsed = Number.parseInt(original.replace(/\D/g, ""), 10);
            if (!Number.isFinite(parsed)) {
                return;
            }

            if (REDUCED_MOTION) {
                return;
            }

            const duration = 900;
            const start = performance.now();

            const frame = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const nextValue = Math.round(parsed * progress);
                counter.textContent = original.replace(String(parsed), String(nextValue));
                if (progress < 1) {
                    requestAnimationFrame(frame);
                }
            };

            requestAnimationFrame(frame);
        };

        if (!("IntersectionObserver" in window)) {
            counters.forEach(animateCounter);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.35 });

        counters.forEach((counter) => observer.observe(counter));
    }

    function initHeroParallax() {
        const hero = document.querySelector(".hero");
        if (!hero || REDUCED_MOTION) {
            return;
        }

        let ticking = false;

        const onScroll = () => {
            if (ticking) {
                return;
            }

            ticking = true;
            requestAnimationFrame(() => {
                const offset = window.scrollY * 0.18;
                hero.style.transform = `translate3d(0, ${offset}px, 0)`;
                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
    }

    function detectDepartmentImages() {
        document.querySelectorAll(".department-card").forEach((card) => {
            const img = card.querySelector("img");
            if (img && img.getAttribute("src")) {
                card.classList.add("has-image");
            }
        });
    }

    function generateSelector(el) {
        const path = [];
        let current = el;

        while (current && current.nodeType === Node.ELEMENT_NODE) {
            const tag = current.tagName.toLowerCase();

            if (current.id) {
                path.unshift(`${tag}#${current.id}`);
                break;
            }

            let index = 1;
            let sibling = current.previousElementSibling;
            while (sibling) {
                if (sibling.tagName === current.tagName) {
                    index += 1;
                }
                sibling = sibling.previousElementSibling;
            }

            path.unshift(`${tag}:nth-of-type(${index})`);
            current = current.parentElement;
        }

        return path.join(" > ");
    }
})();