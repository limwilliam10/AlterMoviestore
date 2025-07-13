(function() {
    let style = document.createElement("style");
    style.innerHTML = `
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        text-align: center;
    }
    .container {
        width: 90%;
        max-width: 800px;
        margin: 20px auto;
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .landing {
        padding: 20px;
        background: #2a5298;
        color: rgb(255, 255, 255);
        border-radius: 10px;
        margin-bottom: 20px;
    }
    .filter-container {
        width: 100%;
    }
    #title-filter {
        width: 99%;
        box-sizing: border-box;
        padding: 10px;
        margin-bottom: 10px;
    }
    .filter-bar {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }
    .filter-bar select, .filter-bar input {
        flex: 1;
        padding: 10px;
        margin: 0 5px;
        min-width: 22.5%;
        box-sizing: border-box;
    }
    .film-list, .cart-list {
        list-style: none;
        padding: 0;
    }
    .film-list li, .cart-list li {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: left;
        gap: 30px;
    }
    .buy-button {
        padding: 10px;
        background: #009688;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        min-width: 150px;
        text-align: center;
    }
    .checkout-button {
        padding: 10px;
        background: #009688;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
    }
    .remove-button {
        padding: 10px;
        background: #e64a19;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
    }
    .buy-button:hover, .checkout-button:hover {
        background: #027c70;
    }
    .remove-button:hover {
        background: #c0370d;
    }
    .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        gap: 10px;
    }
    .pagination button {
        padding: 10px;
        border: none;
        background: #2196F3;
        color: white;
        cursor: pointer;
        border-radius: 5px;
    }
    .pagination button:disabled {
        background: #bbb;
        cursor: not-allowed;
    }
    .form-input {
        width: 98%;
        padding: 8px;
        margin: 5px 0;
        border: 1px solid #ccc;
        border-radius: 5px;
    }
    .film-info {
        flex: 1;
        word-wrap: break-word;
    }
    `;
    document.head.appendChild(style);
})();

let discountPercentage = 50; // Ganti sesuai diskon (0 = tanpa diskon, 50 = diskon 50%, 100+ = gratis)
let films = [];
let videoQualities = [];
let audioQualities = [];
let genres = [];
let clusters = [];

// Fungsi untuk fetch list film dari API Google Sheets
async function loadFilms() {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbwrJrPUx9rnfP6G8mhvgNsWm6Ffpu-esk1fbcxj9geP9pquD7frxLkvXKRRezQaoKyR/exec"); // Ganti dengan URL Web App terbaru setiap deploy
        const data = await response.json();

        films = data.films;
        videoQualities = data.videoQualities;
        audioQualities = data.audioQualities;
        genres = data.genres;
        clusters = data.clusters;

        populateFilters();
        filterFilms(); 
    } catch (error) {
        console.error("Gagal memuat data film:", error);
    }
}

// Fungsi untuk mengisi filter secara otomatis
function populateFilters() {
    const videoQualityFilter = document.getElementById("video-quality-filter");
    const audioQualityFilter = document.getElementById("audio-quality-filter");
    const genreFilter = document.getElementById("genre-filter");
    const clusterFilter = document.getElementById("cluster-filter");

    // Reset filter
    videoQualityFilter.innerHTML = '<option value="">--- Pilih Kualitas Video ---</option>';
    audioQualityFilter.innerHTML = '<option value="">--- Pilih Kualitas Audio ---</option>';
    genreFilter.innerHTML = '<option value="">--- Pilih Genre ---</option>';
    clusterFilter.innerHTML = '<option value="">--- Pilih Cluster ---</option>';

    // Fungsi mengurutkan filter kualitas video dari angka lalu huruf, bukan sebagai string
    function extractNumber(resolution) {
        let match = resolution.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }

    videoQualities.sort((a, b) => {
        let numA = extractNumber(a);
        let numB = extractNumber(b);

        let textA = a.replace(/\d+p?/, "").trim();
        let textB = b.replace(/\d+p?/, "").trim();

        if (!textA && !textB) return numA - numB;

        if (!textA) return -1; 
        if (!textB) return 1;  

        return textA.localeCompare(textB) || numA - numB;
    });

    clusters.sort((a, b) => {
        let numA = a.match(/\d+/) ? parseInt(a.match(/\d+/)[0]) : null;
        let numB = b.match(/\d+/) ? parseInt(b.match(/\d+/)[0]) : null;

        let isNumA = numA !== null && a.includes("Top");
        let isNumB = numB !== null && b.includes("Top");

        if (isNumA && !isNumB) return 1;
        if (!isNumA && isNumB) return -1;

        if (isNumA && isNumB) return numA - numB;

        return a.localeCompare(b);
    });

    // Tambahkan pilihan kualitas video
    videoQualities.forEach(video => {
        let option = document.createElement("option");
        option.value = video;
        option.textContent = video;
        videoQualityFilter.appendChild(option);
    });

    // Tambahkan pilihan kualitas audio
    audioQualities.sort().forEach(audio => {
        let option = document.createElement("option");
        option.value = audio;
        option.textContent = audio;
        audioQualityFilter.appendChild(option);
    });

    // Tambahkan pilihan genre
    genres.sort().forEach(genre => {
        let option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });

    // Tambahkan pilihan cluster
    clusters.forEach(cluster => {
        let option = document.createElement("option");
        option.value = cluster;
        option.textContent = cluster;
        clusterFilter.appendChild(option);
    });
}

// Fungsi filter film dengan Cluster
function filterFilms() {
    let title = document.getElementById("title-filter").value.toLowerCase();
    let videoQuality = document.getElementById("video-quality-filter").value;
    let audioQuality = document.getElementById("audio-quality-filter").value;
    let genre = document.getElementById("genre-filter").value;
    let cluster = document.getElementById("cluster-filter").value;
    filteredFilms = films.filter(film => 
        (title === "" || film.title.toLowerCase().includes(title)) &&
        (videoQuality === "" || film.videoQuality === videoQuality) &&
        (audioQuality === "" || film.audioQuality === audioQuality) &&
        (genre === "" || film.genre.includes(genre)) && // Cek apakah film memiliki genre yang dipilih
        (cluster === "" || film.cluster.includes(cluster)) // Cek apakah film memiliki cluster yang dipilih
    );
    currentPage = 1;
    renderFilms();
}

// Panggil loadFilms saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadFilms);
let filteredFilms = [...films];
let cart = [];
let currentPage = 1;
const itemsPerPage = 10;

// Fungsi menampilkan list film
function renderFilms() {
    const filmList = document.getElementById("film-list");
    filmList.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedFilms = filteredFilms.slice(start, end);
    paginatedFilms.forEach(film => {
        let li = document.createElement("li");
        li.innerHTML = `
            <div class="film-info">
                <span><strong>${film.title}</strong><br>ℹ️${film.videoQuality} | ${film.audioQuality} | ${film.genre}</span>
            </div>
        `;
        let button = document.createElement("button"); button.className = "buy-button"; button.textContent = "Tambah ke Keranjang"; button.addEventListener("click", function() { addToCart(film.title); }); li.appendChild(button);
        filmList.appendChild(li);
    });
    document.getElementById("page-info").textContent = `Halaman ${currentPage} dari ${Math.ceil(filteredFilms.length / itemsPerPage)}`;
    document.getElementById("prev-btn").disabled = currentPage === 1;
    document.getElementById("next-btn").disabled = currentPage === Math.ceil(filteredFilms.length / itemsPerPage);
}

// Fungsi tombol Tambah ke Keranjang
function addToCart(filmName) {
    if (cart.includes(filmName)) {
        alert("Film sudah ada di keranjang belanja, silakan pilih film lain.");
        return;
    }
    cart.push(filmName);
    updateCart();
}

// Fungsi tombol Hapus dari keranjang 
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Skema harga bertingkat
const pricing = [
    { quantity: 1000, price: 8400000 },
    { quantity: 100, price: 850000 },
    { quantity: 50, price: 430000 },
    { quantity: 10, price: 90000 },
    { quantity: 1, price: 10000 },
];
const seriesPrice = 50000;

// Fungsi untuk menampilkan skema harga di landing page secara urut
function updatePriceList() {
    let priceList = document.getElementById("price-list");
    priceList.innerHTML = "";

    let sortedPricing = [...pricing].sort((a, b) => a.quantity - b.quantity);

    sortedPricing.forEach(tier => {
        let discountedPrice = discountPercentage > 0 ? Math.round(tier.price * (1 - discountPercentage / 100)) : tier.price;
        let discountText = discountPercentage > 0 ? ` [Diskon ${discountPercentage}%]` : "";
        
        let listItem = document.createElement("li");
        listItem.innerHTML = discountPercentage > 0
            ? `📀 <b>${tier.quantity} film:</b> <s>Rp ${tier.price.toLocaleString()}</s> Rp ${discountedPrice.toLocaleString()}${discountText}`
            : `📀 <b>${tier.quantity} film:</b> Rp ${tier.price.toLocaleString()}`;

        priceList.appendChild(listItem);
    })
    let discountedSeriesPrice = discountPercentage > 0 ? Math.round(seriesPrice * (1 - discountPercentage / 100)) : seriesPrice;
    let seriesDiscountText = discountPercentage > 0 ? ` [Diskon ${discountPercentage}%]` : "";

    let seriesItem = document.createElement("li");
    seriesItem.innerHTML = discountPercentage > 0
        ? `<br>📺 <b>Khusus Film Series:* 📺</b><br>🎬 <s>Rp ${seriesPrice.toLocaleString()} /season</s> Rp ${discountedSeriesPrice.toLocaleString()} /season${seriesDiscountText}<br><b>*</b>(Lebih hemat! Tiap season selalu lebih dari 5 episode)`
        : `<br><b>Khusus Film Series:*</b><br>📺 Rp ${seriesPrice.toLocaleString()} /season<br><b>*</b>(Lebih hemat! Tiap season selalu lebih dari 5 episode)`;

    priceList.appendChild(seriesItem);
}

// Fungsi untuk menghitung total harga berdasarkan jumlah film
function calculateTotalPrice() {
    let totalFilms = cart.length;
    let totalPrice = 0;
    let remaining = totalFilms;

    let seriesCount = cart.filter(film => {
        let filmData = films.find(f => f.title === film);
        return filmData && filmData.cluster.includes("Series");
    }).length;

    let normalCount = totalFilms - seriesCount;

    // Hitung harga untuk film biasa
    let remainingNormal = normalCount;
    for (let tier of pricing) {
        while (remainingNormal >= tier.quantity) {
            totalPrice += tier.price;
            remainingNormal -= tier.quantity;
        }
    }

    // Hitung harga untuk film Series
    totalPrice += seriesCount * seriesPrice;

    // Terapkan diskon
    if (discountPercentage > 0) {
        let discountedPrice = totalPrice * (1 - discountPercentage / 100);
        return {
            originalPrice: totalPrice,
            discountedPrice: discountPercentage >= 100 ? 0 : Math.round(discountedPrice)
        };
    }

    return { originalPrice: totalPrice, discountedPrice: totalPrice };
}

// Fungsi untuk mengupdate list dan harga di keranjang setiap ada penambahan atau pengurangan
function updateCart() {
    let cartList = document.getElementById("cart-list");
    let cartCount = document.getElementById("cart-count");
    let totalPriceElement = document.getElementById("total-price");

    cartList.innerHTML = "";
    cart.forEach((film, index) => {
        let li = document.createElement("li");
        li.innerHTML = `${film} <button class='remove-button' onclick='removeFromCart(${index})'>Hapus</button>`;
        cartList.appendChild(li);
    });

    let { originalPrice, discountedPrice } = calculateTotalPrice();
    let discountText = discountPercentage > 0 ? ` [Diskon ${discountPercentage}%]` : "";

    cartCount.textContent = cart.length;
    totalPriceElement.innerHTML = discountPercentage > 0
        ? `Total Harga <s>Rp ${originalPrice.toLocaleString()}</s> Rp ${discountedPrice.toLocaleString()}${discountText}`
        : `Total Harga Rp ${originalPrice.toLocaleString()}`;
}

// Fungsi tombol Checkout
function checkout() {
    let name = document.getElementById("buyer-name").value;
    let email = document.getElementById("buyer-email").value;
    let whatsapp = document.getElementById("buyer-whatsapp").value;

    if (!name || !email || !whatsapp) {
        alert("Harap isi semua data pembeli sebelum checkout!\n\nData pembeli diperlukan untuk pengiriman:\n• Bukti Pembelian\n• Bukti Pembayaran");
        return;
    }

    if (cart.length === 0) {
        alert("Keranjang Anda kosong!");
        return;
    }

    let { originalPrice, discountedPrice } = calculateTotalPrice();
    let discountText = discountPercentage > 0 ? ` [Diskon ${discountPercentage}%]` : "";
    let filmList = cart.join(", ");

    // Fungsi untuk kirim Order Log ke API Google Sheets
    let orderLogUrl = "https://script.google.com/macros/s/AKfycbzp--ZGgK5rEIoDY4WWBhXHXa6UiD4lAKqTzhSxXw1O2xswM-4ZXkMG0Vz2CPdws99z9g/exec"; // Ganti dengan URL Web App terbaru setiap deploy
    let orderParams = new URLSearchParams({
        nama: name,
        email: email,
        whatsapp: whatsapp,
        jumlahFilm: cart.length,
        totalHarga: discountPercentage > 0 ? discountedPrice : originalPrice,
        diskon: discountPercentage > 0 ? discountPercentage : 0,
        listFilm: filmList
    });

    // Kirim via fetch (POST request)
    fetch(orderLogUrl, {
        method: "POST",
        body: orderParams
    })
    .then(response => response.text())
    .then(result => console.log("Order log result:", result))
    .catch(error => console.error("Error saving order log:", error));

    // Format pesan WhatsApp
    let message = `Halo Alter Movistore Admin, saya ingin membeli ${cart.length} film,` + ` dengan total harga ${discountPercentage > 0 ? `~(sebelumnya Rp ${originalPrice.toLocaleString()})~ menjadi Rp ${discountedPrice.toLocaleString()}${discountText}` : `Rp ${originalPrice.toLocaleString()}`}\n` + `\n*DATA PEMBELI*\nNama Lengkap: ${name}\nAlamat Email: ${email}\nNomor WhatsApp: ${whatsapp}\n\nBerikut list film yang saya pilih:\n`;
    cart.forEach((film, index) => {
        message += `${index + 1}. ${film}\n`;
    });

    // Encode pesan agar bisa dikirim ke WhatsApp
    let encodedMessage = encodeURIComponent(message);
    let whatsappNumber = "6282260606968"; // Format internasional (62 untuk Indonesia)

    // Redirect ke WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");

    // Kosongkan keranjang setelah checkout
    cart = [];
    updateCart();
}

// Panggil fungsi untuk memperbarui harga di landing page
document.addEventListener("DOMContentLoaded", updatePriceList);
function nextPage() {
    currentPage++;
    renderFilms();
}
function prevPage() {
    currentPage--;
    renderFilms();
}
renderFilms();

// obfuscator.io //
// Compact // Simplify
// Contra Flow Flattening Threshold 0.9
// Dead Code Injection Threshold 0.9
// String Array // String Array Rotate // String Array Shuffle // String Array Threshold 0.8
// Disable Console Output // Self Defending // Debug Protection Interval 20 ms
// String Array Encoding RC4 && Base64
// Domain Lock altermovie.store