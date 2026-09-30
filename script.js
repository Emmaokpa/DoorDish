document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Smooth Scrolling for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 2. Header Shadow on Scroll & Mobile Menu Toggle ---
    const header = document.querySelector('.header');
    const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
    const navLinks = document.querySelector('.nav-links');

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
            } else {
                header.style.boxShadow = 'none';
            }
        });
    }

    if (mobileMenuTrigger) {
        mobileMenuTrigger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuTrigger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            if (mobileMenuTrigger) {
                const icon = mobileMenuTrigger.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });

    // --- 3. Global Modal Logic ---
    const globalModal = document.getElementById('global-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalIconContainer = document.getElementById('modal-icon');

    function showModal(title, text, type = 'success') {
        if (!globalModal) return;
        
        modalTitle.innerText = title;
        modalText.innerText = text;
        
        // Update icon based on type
        const icon = modalIconContainer.querySelector('i');
        icon.className = 'fa-solid';
        if (type === 'success') {
            icon.classList.add('fa-circle-check');
            icon.style.color = '#2ecc71';
        } else if (type === 'error') {
            icon.classList.add('fa-circle-xmark');
            icon.style.color = '#e74c3c';
        } else {
            icon.classList.add('fa-circle-info');
            icon.style.color = 'var(--accent-orange)';
        }
        
        globalModal.classList.add('active');
    }

    function hideModal() {
        if (globalModal) globalModal.classList.remove('active');
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideModal);
    if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', hideModal);
    if (globalModal) {
        globalModal.addEventListener('click', (e) => {
            if (e.target === globalModal) hideModal();
        });
    }

    // --- 4. Handle Form Submissions (Reservation & Contact) ---
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            
            const originalText = submitBtn.innerText;
            
            submitBtn.innerText = 'Processing...';
            submitBtn.style.opacity = '0.8';
            
            setTimeout(() => {
                submitBtn.innerText = originalText;
                submitBtn.style.backgroundColor = '';
                submitBtn.style.opacity = '1';
                
                showModal('Message Received!', 'Thank you for reaching out to DoorDish. Our team will get back to you shortly.');
                form.reset();
            }, 1000);
        });
    });

    // --- 5. Cart Functionality ---
    let cart = JSON.parse(localStorage.getItem('doordish_cart')) || [];
    
    const cartTrigger = document.querySelector('.cart-trigger');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartCountEl = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalEl = document.getElementById('cart-total');
    
    // Toggle Cart open/close
    function toggleCart() {
        if (!cartSidebar) return;
        const isOpen = cartSidebar.classList.contains('open');
        if (isOpen) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        } else {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; // prevent bg scroll
            renderCart();
        }
    }

    if (cartTrigger) cartTrigger.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    // Initial count render (so header cart count is correct on load)
    updateCartCount();

    // Add to Cart Handlers
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = e.target.getAttribute('data-name');
            const price = parseInt(e.target.getAttribute('data-price'));
            
            // Add to cart array
            cart.push({ name, price, id: Date.now() });
            localStorage.setItem('doordish_cart', JSON.stringify(cart));
            
            // Visual feedback on button
            const originalText = e.target.innerText;
            e.target.innerText = 'Added!';
            e.target.style.backgroundColor = '#2ecc71'; // green
            
            setTimeout(() => {
                e.target.innerText = originalText;
                e.target.style.backgroundColor = '';
            }, 1000);

            updateCartCount();
            
            // Open cart to show user
            if (!cartSidebar.classList.contains('open')) {
                toggleCart();
            } else {
                renderCart();
            }
        });
    });

    function updateCartCount() {
        if (cartCountEl) {
            cartCountEl.innerText = cart.length;
            
            // Notification Pop Effect
            if (cart.length > 0) {
                cartCountEl.style.transform = 'scale(1.4)';
                setTimeout(() => {
                    cartCountEl.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }

    function renderCart() {
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty.</div>';
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * (item.quantity || 1);
                total += itemTotal;
                
                let detailsHtml = '';
                if (item.spice) {
                    detailsHtml += `<span style="display:block; font-size:0.78rem; color:#666;">🌶️ Spice: ${item.spice}</span>`;
                }
                if (item.addons && item.addons.length > 0) {
                    detailsHtml += `<span style="display:block; font-size:0.78rem; color:#666;">➕ ${item.addons.join(', ')}</span>`;
                }
                if (item.notes) {
                    detailsHtml += `<span style="display:block; font-size:0.78rem; color:#888; font-style:italic;">📝 "${item.notes}"</span>`;
                }

                const div = document.createElement('div');
                div.className = 'cart-item-row';
                div.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}</h4>
                        ${detailsHtml}
                        <p>₦${itemTotal.toLocaleString()}</p>
                    </div>
                    <button class="remove-item-btn" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                `;
                cartItemsContainer.appendChild(div);
            });

            // Bind remove buttons
            const removeBtns = cartItemsContainer.querySelectorAll('.remove-item-btn');
            removeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.currentTarget.getAttribute('data-index');
                    cart.splice(idx, 1);
                    localStorage.setItem('doordish_cart', JSON.stringify(cart));
                    renderCart();
                    updateCartCount();
                });
            });
        }

        if (cartTotalEl) {
            cartTotalEl.innerText = `₦${total.toLocaleString()}`;
        }
    }

    // Handle Checkout click
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showModal('Cart Empty', 'Please add some delicious items to your cart before checking out.', 'info');
                return;
            }
            checkoutBtn.innerText = 'Processing...';
            setTimeout(() => {
                showModal('Order Success!', 'Your premium order has been placed. Sit back and enjoy as we prepare your feast.');
                cart = [];
                localStorage.removeItem('doordish_cart');
                renderCart();
                updateCartCount();
                checkoutBtn.innerText = 'Proceed to Checkout';
                setTimeout(() => {
                    toggleCart();
                }, 500);
            }, 1000);
        });
    }

    // --- Feature 1: Menu Search & Dietary Filter System ---
    const menuSearchInput = document.getElementById('menu-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const categoryBtns = document.querySelectorAll('.category-tabs .filter-btn');
    const dietaryChips = document.querySelectorAll('.dietary-filters .dietary-chip');
    const menuCards = document.querySelectorAll('.menu-item-card');
    const categoryGroups = document.querySelectorAll('.menu-category');
    const noResultsMsg = document.getElementById('no-results-msg');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    if (menuSearchInput || categoryBtns.length > 0) {
        let activeCategory = 'all';
        let activeDietary = 'all';
        let searchQuery = '';

        function filterMenu() {
            let totalVisible = 0;

            // Track visibility per category group
            categoryGroups.forEach(group => {
                const groupCategory = group.getAttribute('data-category-group');
                const cards = group.querySelectorAll('.menu-item-card');
                let groupVisibleCount = 0;

                cards.forEach(card => {
                    const itemCat = card.getAttribute('data-category') || '';
                    const itemDietary = card.getAttribute('data-dietary') || '';
                    const itemName = card.getAttribute('data-name') || '';
                    const itemDesc = card.getAttribute('data-description') || '';

                    const matchesCategory = (activeCategory === 'all' || itemCat === activeCategory);
                    const matchesDietary = (activeDietary === 'all' || itemDietary.includes(activeDietary));
                    const matchesSearch = !searchQuery || 
                        itemName.toLowerCase().includes(searchQuery) || 
                        itemDesc.toLowerCase().includes(searchQuery);

                    if (matchesCategory && matchesDietary && matchesSearch) {
                        card.style.display = 'flex';
                        groupVisibleCount++;
                        totalVisible++;
                    } else {
                        card.style.display = 'none';
                    }
                });

                // Show/hide category section header if all items are hidden
                if (groupVisibleCount > 0) {
                    group.style.display = 'block';
                } else {
                    group.style.display = 'none';
                }
            });

            // Show 'No results' message if total visible items is 0
            if (noResultsMsg) {
                if (totalVisible === 0) {
                    noResultsMsg.style.display = 'block';
                } else {
                    noResultsMsg.style.display = 'none';
                }
            }
        }

        // Live Search Input Event
        if (menuSearchInput) {
            menuSearchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim().toLowerCase();
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
                }
                filterMenu();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (menuSearchInput) menuSearchInput.value = '';
                searchQuery = '';
                clearSearchBtn.style.display = 'none';
                filterMenu();
            });
        }

        // Category Filter Tabs Event
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-category');
                filterMenu();
            });
        });

        // Dietary Filter Chips Event
        dietaryChips.forEach(chip => {
            chip.addEventListener('click', () => {
                dietaryChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                activeDietary = chip.getAttribute('data-dietary');
                filterMenu();
            });
        });

        // Reset Filters Button
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                activeCategory = 'all';
                activeDietary = 'all';
                searchQuery = '';

                if (menuSearchInput) menuSearchInput.value = '';
                if (clearSearchBtn) clearSearchBtn.style.display = 'none';

                categoryBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-category') === 'all'));
                dietaryChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-dietary') === 'all'));

                filterMenu();
            });
        }
    }

    // --- Feature 2: Food Customizer & Special Instructions Modal ---
    const customizerModal = document.getElementById('customizer-modal');
    const customizerCloseBtn = document.getElementById('customizer-close-btn');
    const customizerImg = document.getElementById('customizer-img');
    const customizerTitle = document.getElementById('customizer-title');
    const customizerDesc = document.getElementById('customizer-desc');
    const customizerBasePriceEl = document.getElementById('customizer-base-price');
    const spiceBtns = document.querySelectorAll('.spice-btn');
    const addonInputs = document.querySelectorAll('.addon-input');
    const customizerNotes = document.getElementById('customizer-notes');
    const qtyMinusBtn = document.getElementById('qty-minus-btn');
    const qtyPlusBtn = document.getElementById('qty-plus-btn');
    const qtyDisplay = document.getElementById('qty-display');
    const addCustomizedCartBtn = document.getElementById('add-customized-cart-btn');

    let currentItem = {
        name: '',
        basePrice: 0,
        imgSrc: '',
        desc: '',
        spice: 'Mild',
        addons: [],
        notes: '',
        quantity: 1
    };

    function calculateCustomizerTotal() {
        let addonTotal = 0;
        addonInputs.forEach(input => {
            if (input.checked) {
                addonTotal += parseInt(input.getAttribute('data-addon-price') || 0);
            }
        });

        const singleItemPrice = currentItem.basePrice + addonTotal;
        const finalTotal = singleItemPrice * currentItem.quantity;

        if (addCustomizedCartBtn) {
            addCustomizedCartBtn.innerText = `Add to Order (₦${finalTotal.toLocaleString()})`;
        }
        return finalTotal;
    }

    function openCustomizerModal(name, basePrice, imgSrc, desc) {
        if (!customizerModal) return;

        currentItem.name = name;
        currentItem.basePrice = parseInt(basePrice);
        currentItem.imgSrc = imgSrc || 'assets/images/chef_special.jpg';
        currentItem.desc = desc || '';
        currentItem.spice = 'Mild';
        currentItem.addons = [];
        currentItem.notes = '';
        currentItem.quantity = 1;

        if (customizerTitle) customizerTitle.innerText = name;
        if (customizerDesc) customizerDesc.innerText = desc || 'Prepared fresh using fine artisan ingredients.';
        if (customizerImg) customizerImg.src = currentItem.imgSrc;
        if (customizerBasePriceEl) customizerBasePriceEl.innerText = `Base: ₦${currentItem.basePrice.toLocaleString()}`;
        if (qtyDisplay) qtyDisplay.innerText = '1';
        if (customizerNotes) customizerNotes.value = '';

        // Reset Spice Level UI
        spiceBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-spice') === 'Mild');
        });

        // Reset Addons UI
        addonInputs.forEach(input => {
            input.checked = false;
        });

        calculateCustomizerTotal();
        customizerModal.classList.add('active');
    }

    function closeCustomizerModal() {
        if (customizerModal) customizerModal.classList.remove('active');
    }

    if (customizerCloseBtn) customizerCloseBtn.addEventListener('click', closeCustomizerModal);
    if (customizerModal) {
        customizerModal.addEventListener('click', (e) => {
            if (e.target === customizerModal) closeCustomizerModal();
        });
    }

    // Spice Buttons Event
    spiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            spiceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentItem.spice = btn.getAttribute('data-spice');
        });
    });

    // Addon Checkboxes Event
    addonInputs.forEach(input => {
        input.addEventListener('change', () => {
            calculateCustomizerTotal();
        });
    });

    // Quantity Buttons
    if (qtyMinusBtn) {
        qtyMinusBtn.addEventListener('click', () => {
            if (currentItem.quantity > 1) {
                currentItem.quantity--;
                if (qtyDisplay) qtyDisplay.innerText = currentItem.quantity;
                calculateCustomizerTotal();
            }
        });
    }

    if (qtyPlusBtn) {
        qtyPlusBtn.addEventListener('click', () => {
            currentItem.quantity++;
            if (qtyDisplay) qtyDisplay.innerText = currentItem.quantity;
            calculateCustomizerTotal();
        });
    }

    // Attach Customizer Click Handler to Dish Item Cards
    menuCards.forEach(card => {
        const img = card.querySelector('img');
        const title = card.querySelector('h3');
        const orderBtn = card.querySelector('.add-to-cart-btn');

        const triggerCustomizer = (e) => {
            // Prevent triggering if order button was clicked directly
            if (e.target.classList.contains('add-to-cart-btn')) return;

            const name = card.getAttribute('data-name') || title?.innerText || 'Special Dish';
            const price = orderBtn?.getAttribute('data-price') || 5000;
            const imgSrc = img?.getAttribute('src') || '';
            const desc = card.getAttribute('data-description') || card.querySelector('p')?.innerText || '';

            openCustomizerModal(name, price, imgSrc, desc);
        };

        if (img) img.style.cursor = 'pointer';
        if (title) title.style.cursor = 'pointer';

        card.addEventListener('click', triggerCustomizer);
    });

    // Add Customized Item to Order Button
    if (addCustomizedCartBtn) {
        addCustomizedCartBtn.addEventListener('click', () => {
            // Collect checked addons
            const selectedAddons = [];
            let addonTotal = 0;
            addonInputs.forEach(input => {
                if (input.checked) {
                    const addonName = input.getAttribute('data-addon-name');
                    const addonPrice = parseInt(input.getAttribute('data-addon-price') || 0);
                    selectedAddons.push(addonName);
                    addonTotal += addonPrice;
                }
            });

            const finalSinglePrice = currentItem.basePrice + addonTotal;
            const notesText = customizerNotes ? customizerNotes.value.trim() : '';

            // Add item to cart
            cart.push({
                name: currentItem.name,
                price: finalSinglePrice,
                spice: currentItem.spice,
                addons: selectedAddons,
                notes: notesText,
                quantity: currentItem.quantity,
                id: Date.now()
            });

            localStorage.setItem('doordish_cart', JSON.stringify(cart));
            updateCartCount();
            closeCustomizerModal();

            // Open side cart
            if (!cartSidebar.classList.contains('open')) {
                toggleCart();
            } else {
                renderCart();
            }
        });
    }

});


