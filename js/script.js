/* ==========================================================
   NZRP WEBSITE
   SCRIPT.JS
========================================================== */

/* ==========================================================
   EDIT MODE
========================================================== */

let editMode = false;

// Create edit button
const editButton = document.createElement('button');
editButton.textContent = 'Edit Mode';
editButton.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 12px 24px;
    background: #ff6b35;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    z-index: 999;
    transition: .25s;
`;

editButton.addEventListener('mouseenter', () => {
    editButton.style.background = '#ff8555';
});

editButton.addEventListener('mouseleave', () => {
    editButton.style.background = '#ff6b35';
});

editButton.addEventListener('click', toggleEditMode);

document.body.appendChild(editButton);

// Create save button (hidden by default)
const saveButton = document.createElement('button');
saveButton.textContent = 'Save Changes';
saveButton.style.cssText = `
    position: fixed;
    top: 100px;
    right: 180px;
    padding: 12px 24px;
    background: #22bb33;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    z-index: 999;
    transition: .25s;
    display: none;
`;

saveButton.addEventListener('mouseenter', () => {
    saveButton.style.background = '#2dd942';
});

saveButton.addEventListener('mouseleave', () => {
    saveButton.style.background = '#22bb33';
});

saveButton.addEventListener('click', saveAllChanges);

document.body.appendChild(saveButton);

// Restore edits on page load
window.addEventListener('load', restoreSavedEdits);

function restoreSavedEdits() {
    const savedData = localStorage.getItem('hnzrp_site_edits');
    if (savedData) {
        try {
            const edits = JSON.parse(savedData);
            Object.entries(edits).forEach(([selector, content]) => {
                const el = document.querySelector(selector);
                if (el) {
                    el.textContent = content;
                }
            });
        } catch (e) {
            console.error('Error restoring edits:', e);
        }
    }
}

function toggleEditMode() {
    editMode = !editMode;
    
    if (editMode) {
        editButton.textContent = '✓ Exit Edit';
        editButton.style.background = '#22bb33';
        saveButton.style.display = 'block';
        enableEditing();
    } else {
        editButton.textContent = 'Edit Mode';
        editButton.style.background = '#ff6b35';
        saveButton.style.display = 'none';
        disableEditing();
    }
}

let editableElements = new Map();

function enableEditing() {
    // Track all editable elements with unique selectors
    document.querySelectorAll('h1, h2, h3, p, span').forEach((el) => {
        if (el.closest('.logo') || el.closest('.nav-links') || el.closest('.discord-button') || el.closest('button') || el.closest('footer')) return;
        
        // Generate unique selector
        const selector = generateUniqueSelector(el);
        editableElements.set(selector, el);
        
        el.style.cursor = 'pointer';
        el.style.outline = '2px dashed rgba(33,136,255,.5)';
        el.style.padding = '5px';
        el.style.backgroundColor = 'rgba(33,136,255,.1)';
        el.addEventListener('click', makeEditable);
    });
}

function disableEditing() {
    editableElements.forEach((el) => {
        el.style.cursor = 'default';
        el.style.outline = 'none';
        el.style.padding = '0';
        el.style.backgroundColor = '';
        el.removeEventListener('click', makeEditable);
    });
}

function generateUniqueSelector(el) {
    let path = [];
    let current = el;
    
    while (current.parentElement) {
        let index = 0;
        let sibling = current;
        
        while (sibling.previousElementSibling) {
            sibling = sibling.previousElementSibling;
            index++;
        }
        
        let selector = current.tagName.toLowerCase();
        if (current.id) {
            selector += '#' + current.id;
            path.unshift(selector);
            break;
        } else if (current.className) {
            selector += '.' + current.className.split(' ').join('.');
        }
        
        path.unshift(selector);
        current = current.parentElement;
    }
    
    return path.join(' > ');
}

function makeEditable(e) {
    e.stopPropagation();
    const el = e.target;
    const originalText = el.textContent;
    const selector = generateUniqueSelector(el);
    
    const input = document.createElement('textarea');
    input.value = originalText;
    input.style.cssText = `
        width: 100%;
        padding: 10px;
        font-size: ${window.getComputedStyle(el).fontSize};
        font-weight: ${window.getComputedStyle(el).fontWeight};
        font-family: ${window.getComputedStyle(el).fontFamily};
        border: 2px solid #2188ff;
        border-radius: 8px;
        background: #0d161f;
        color: white;
        resize: vertical;
        z-index: 1000;
    `;
    
    el.replaceWith(input);
    input.focus();
    input.select();
    
    function saveEdit() {
        const newText = input.value.trim();
        el.textContent = newText || originalText;
        input.replaceWith(el);
        
        // Store in memory for save button
        editableElements.set(selector, el);
    }
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            saveEdit();
        }
    });
}

function saveAllChanges() {
    const edits = {};
    
    editableElements.forEach((el, selector) => {
        edits[selector] = el.textContent;
    });
    
    localStorage.setItem('hnzrp_site_edits', JSON.stringify(edits));
    
    // Visual feedback
    const originalText = saveButton.textContent;
    saveButton.textContent = '✓ Saved!';
    saveButton.style.background = '#1aa824';
    
    setTimeout(() => {
        saveButton.textContent = 'Save Changes';
        saveButton.style.background = '#22bb33';
    }, 2000);
}

/* ==========================================================
   NAVBAR SCROLL EFFECT
========================================================== */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 40) {

        navbar.style.background = "rgba(8,19,29,.95)";
        navbar.style.boxShadow = "0 10px 35px rgba(0,0,0,.35)";

    } else {

        navbar.style.background = "rgba(7,18,28,.55)";
        navbar.style.boxShadow = "none";

    }

});

/* ==========================================================
   SEARCH + FILTER
========================================================== */

const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");

const cards = document.querySelectorAll(".department-card");

function updateDepartments() {

    const search = searchInput.value.toLowerCase();
    const filter = filterSelect.value;

    cards.forEach(card => {

        const title = card
            .querySelector("h2")
            .textContent
            .toLowerCase();

        const category = card.dataset.category;

        const matchesSearch =
            title.includes(search);

        const matchesFilter =
            filter === "all" ||
            category === filter;

        if (matchesSearch && matchesFilter) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}

searchInput.addEventListener(
    "input",
    updateDepartments
);

filterSelect.addEventListener(
    "change",
    updateDepartments
);

/* ==========================================================
   FADE IN ON SCROLL
========================================================== */

const observer = new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},

{
    threshold:.15
}

);

cards.forEach(card=>{

observer.observe(card);

});

/* ==========================================================
   SMOOTH SCROLL
========================================================== */

document.querySelectorAll('a[href^="#"]')
.forEach(anchor=>{

anchor.addEventListener("click",function(e){

const target=document.querySelector(
this.getAttribute("href")
);

if(target){

e.preventDefault();

target.scrollIntoView({

behavior:"smooth"

});

}

});

});

/* ==========================================================
   ACTIVE NAV LINK
========================================================== */

const sections =
document.querySelectorAll("section");

const navLinks =
document.querySelectorAll(".nav-links a");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(section=>{

const top=section.offsetTop-120;

const height=section.clientHeight;

if(pageYOffset>=top){

current=section.getAttribute("id");

}

});

navLinks.forEach(link=>{

link.classList.remove("active");

if(link.getAttribute("href")==="#"+current){

link.classList.add("active");

}

});

});

/* ==========================================================
   CARD HOVER SHADOW
========================================================== */

cards.forEach(card=>{

card.addEventListener("mouseenter",()=>{

card.style.boxShadow=
"0 35px 70px rgba(0,0,0,.45)";

});

card.addEventListener("mouseleave",()=>{

card.style.boxShadow="";

});

});

/* ==========================================================
   STAT COUNTER
========================================================== */

const counters =
document.querySelectorAll(".stat h2");

const counterObserver =
new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(!entry.isIntersecting)return;

const counter=entry.target;

const original=counter.innerText;

const number=
parseInt(original.replace(/\D/g,""));

if(isNaN(number))return;

let current=0;

const increment=
Math.ceil(number/80);

const timer=setInterval(()=>{

current+=increment;

if(current>=number){

current=number;

clearInterval(timer);

}

counter.innerText=
original.replace(number,current);

},20);

counterObserver.unobserve(counter);

});

});

counters.forEach(counter=>{

counterObserver.observe(counter);

});

/* ==========================================================
   OPTIONAL PARALLAX HERO
========================================================== */

const hero=document.querySelector(".hero");

window.addEventListener("scroll",()=>{

const offset=window.scrollY;

hero.style.backgroundPosition=
`center ${offset*0.35}px`;

});