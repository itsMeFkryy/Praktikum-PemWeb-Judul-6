# Praktikum-PemWeb-Judul-6

## Nama : Alfikri Deo Putra
## NPM  : 2315061075

Disini merupakan tampilan Web Weather Dashboard sebagai Tugas Akhir Praktikum Pemrograman Web Judul 6

# Fitur Utama
1. Tampilan Cuaca Saat Ini
- Menampilkan suhu, kelembaban, dan kecepatan angin
- Icon visual yang merepresentasikan kondisi cuaca
- Nama lokasi dan timestamp update terbaru
- Update otomatis setiap 5 menit

2. Prakiraan 5 Hari ke Depan
- Prediksi cuaca harian dengan suhu minimum dan maksimum
- Deskripsi kondisi cuaca dan icon 

3. Fungsi Pencarian
- Pencarian kota dengan nama
- Auto-complete suggestions untuk kemudahan pencarian
- Penyimpanan kota favorit di local storage

4. Fitur Interaktif
- Toggle antara Celsius dan Fahrenheit
- Dark/Light mode untuk kenyamanan mata
- Tombol refresh manual untuk update instan
- Indikator loading selama proses pengambilan data

# Teknologi yang Digunakan
## Frontend
- HTML, Struktur dasar aplikasi
- Tailwind CSS, Framework CSS untuk styling responsif
- Font Awesome - Library icon untuk elemen visual
- JavaScript - Logika aplikasi dan interaksi

## Backend & API
- OpenWeatherMap API - Penyedia data cuaca real-time
- Geocoding API - Untuk sistem suggestions kota

# Konfigurasi API
## OpenWeatherMap API
Aplikasi menggunakan dua endpoint utama dari OpenWeatherMap:

### Current Weather Data
https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units={unit}&lang=id

### 5-Day Forecast
https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units={unit}&lang=id

### Geocoding API (untuk suggestions)
https://api.openweathermap.org/geo/1.0/direct?q={query}&limit=5&appid={API_KEY}
