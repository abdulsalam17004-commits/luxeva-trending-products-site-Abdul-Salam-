// script.js
const links = document.querySelectorAll('#navbar a');
const currentPage = window.location.pathname;

links.forEach(link => {
  if (link.getAttribute('href') === currentPage.split('/').pop()) {
    link.classList.add('active');
  }
});

// Load cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const buttons = document.querySelectorAll('.add-cart');
const cartCountDisplays = document.querySelectorAll('.cart-count');

// Update cart count badge
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartCountDisplays.forEach(display => {
    display.textContent = totalItems;

    if (totalItems === 0) {
      display.style.display = 'none';
    } else {
      display.style.display = 'inline-flex';
    }
  });
}

// Add to cart logic
buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const productBox = btn.closest('.product-box');
    const controls = productBox.querySelector('.cart-controls');
    const quantityInput = controls.querySelector('.quantity');
    const brand = productBox.querySelector('.brand')?.textContent.trim() || 'Unknown';
    const priceText = productBox.querySelector('.price')?.textContent || '0';
    const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
    const quantity = parseInt(quantityInput.value) || 1;

    if (controls.style.display === 'none' || controls.style.display === '') {
      controls.style.display = 'block';
      btn.textContent = 'Added';

      const existingItem = cart.find(item => item.brand === brand && item.price === price);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ brand, price, quantity });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
    } else {
      controls.style.display = 'none';
      btn.textContent = 'Add to Cart';
    }
  });
});

function displayCartItems() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  if (!cartItemsContainer) return;

  const cartData = JSON.parse(localStorage.getItem('cart')) || [];

  if (cartData.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  cartItemsContainer.innerHTML = '';
  cartData.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <span>${item.brand}</span>
      <span>${item.quantity} x $${item.price}</span>
    `;
    cartItemsContainer.appendChild(div);
  });
}

function clearCart() {
  localStorage.removeItem('cart');
  cart = [];
  displayCartItems();
  updateCartCount();
}

const bar = document.getElementById('bar');
const mobileLinks = document.getElementById('mobile-links');

if (bar && mobileLinks) {
  bar.addEventListener('click', () => {
    mobileLinks.classList.toggle('show');
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

// Optional: push notification permission
if ('Notification' in window && Notification.permission !== 'denied') {
  Notification.requestPermission().then(function (permission) {
    if (permission === 'granted') {
      new Notification('Welcome to LUXEVA!');
    }
  });
}

updateCartCount();
displayCartItems();

/* =========================================
   LUXURY SEARCH FUNCTIONALITY
========================================= */

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function clearSearchHighlights() {
  document.querySelectorAll('.product-box').forEach(box => {
    box.classList.remove('search-highlight');
  });
}

function performLuxurySearch() {
  if (!searchInput) return;

  const query = searchInput.value.trim().toLowerCase();
  if (!query) return;

  clearSearchHighlights();

  const productBoxes = document.querySelectorAll('.product-box');
  const sectionTitles = document.querySelectorAll('.product-heading-title');

  // 1) Check section titles first (dresses, tops, earrings, lipsticks)
  let matchedSection = null;

  sectionTitles.forEach(title => {
    const titleText = title.textContent.trim().toLowerCase();
    if (titleText.includes(query)) {
      matchedSection = title;
    }
  });

  if (matchedSection) {
    matchedSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight products under that section until next section title
    let next = matchedSection.nextElementSibling;
    let count = 0;

    while (next && !next.classList.contains('product-heading-title')) {
      if (next.classList.contains('product-box')) {
        next.classList.add('search-highlight');
        count++;
      }
      next = next.nextElementSibling;
    }

    // If product cards are inside same grid section, also highlight nearby product boxes
    const parentSection = matchedSection.closest('.featured-scroll');
    if (parentSection) {
      const sectionProducts = parentSection.querySelectorAll('.product-box');
      sectionProducts.forEach(box => box.classList.add('search-highlight'));
    }

    return;
  }

  // 2) Search inside products (brand + name + price)
  let firstMatch = null;

  productBoxes.forEach(box => {
    const brand = box.querySelector('.brand')?.textContent.toLowerCase() || '';
    const name = box.querySelector('h5')?.textContent.toLowerCase() || '';
    const price = box.querySelector('.price')?.textContent.toLowerCase() || '';
    const allText = `${brand} ${name} ${price}`;

    if (allText.includes(query)) {
      box.classList.add('search-highlight');

      if (!firstMatch) {
        firstMatch = box;
      }
    }
  });

  if (firstMatch) {
    firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    alert('No matching luxury product found.');
  }
}

// Button click
if (searchBtn) {
  searchBtn.addEventListener('click', performLuxurySearch);
}

// Enter key support
if (searchInput) {
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      performLuxurySearch();
    }
  });
}