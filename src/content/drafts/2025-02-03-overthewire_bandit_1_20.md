---
title: "overthewire bandit level 1 - 20"
date: 2025-02-03T00:00:00+00:00
author: ariaf.my.id
layout: post
permalink: /blog/bandit1
categories: blog
tags: [ctf, overthewire]
---

apa sih overthewire itu, overthewire merupakan platform untuk belajar ctf, dan overthewire bandit merupakan platform untuk kita bermain ctf hanya saja dengan type general/basic linux. jika masih bingung kita akan langsung praktek saja biar kalian paham.

oke pertama-tama kalian kunjungi website [overthewire/bandit](https://overthewire.org/wargames/bandit/) terlebih dahulu.

nah disini kita perlu menyiapkan terminal terlebih dahulu untuk terminal nya kalian bisa gunakan terminal linux maupun windows karena disini kita hanya perlu melakukan ssh, dan jangan lupa siapkan aplikasi untuk remote ssh seperti openssh, putty, dll.

oke disini saya akan menggunakan aplikasi remote ssh yaitu openssh. untuk cara menggunakanya, kalian bisa coba ketikan perintah ini:
```bash
ssh bandit0@bandit.labs.overthewire.org -p 2220 
```

nah perintah ini digunakan untuk melakukan remote ke server bandit dengan user bandit0, dan port 2220. \
jika kita beru pertama kali atau belum pernah melakukan remote ke host tersebut, seharusnya nanti akan muncul pertanyaan seperti ini.
```
The authenticity of host '[bandit.labs.overthewire.org]:2220 ([16.16.163.126]:2220)' can't be established.
ED25519 key fingerprint is SHA256:C2ihUBV7ihnV1wUXRb4RrEcLfXC5CXlhmAAM/urerLY.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

pertanyaan di atas muncul ketika kita kita belum pernah terhubung ke host tertentu ini digunakan untuk keamanan. agar kita mengetahui bahwa host siapa saja yang terpercaya untuk kita remote. \
kalian bisa ketik yes untuk lanjut: 
```bash
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
```

jika sudah nanti seharusnya akan muncul pertanyaan lagi yaitu password disini kita bisa masukan password user bandit0.
```
bandit0@bandit.labs.overthewire.org's password: 
```

## Level 0 to 1
jika password yang dimasukan benar seharusnya nanti kita akan langsung berhasil login. \
jika sudah login kalian coba lihat file di directory user tersebut, dan kalian coba lakukan cat pada file tersebut.
```bash
bandit0@bandit:~$ ls
readme
bandit0@bandit:~$ cat readme 
Congratulations on your first steps into the bandit game!!
Please make sure you have read the rules at https://overthewire.org/rules/
If you are following a course, workshop, walkthrough or other educational activity,
please inform the instructor about the rules as well and encourage them to
contribute to the OverTheWire community so we can keep these games free!

The password you are looking for is: ZjLjTmM6FvvyRnrb2rfNWOZOTa6ip5If
```

password dari user bandit0 adalah password yang digunakan untuk login ke user bandit1

<span id="level"></span>
untuk level selanjutnya saya tidak akan mencoba untuk menampilkan cara melakukan remote lagi, karena untuk level selanjutnya saya hanya akan memberitahukan bagaimana cara untuk berhasil mendapatkan flag

<style>
  /* Style untuk grid layout */
  .level-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    list-style-type: none;
    padding: 0;
  }

  .level-list li {background-color: #f9f9f9;border: 1px solid #ddd;padding: 10px;border-radius: 8px;text-align: center;}
  .level-list a {text-decoration: none;color: #007bff;font-weight: bold;}
  .level-list a:hover {text-decoration: underline;}
</style>


<ul class="level-list">
  <li><a href="{{ page.url }}#level1-2">Level 1 to 2</a></li>
  <li><a href="{{ page.url }}#level2-3">Level 2 to 3</a></li>
  <li><a href="{{ page.url }}#level3-4">Level 3 to 4</a></li>
  <li><a href="{{ page.url }}#level4-5">Level 4 to 5</a></li>
  <li><a href="{{ page.url }}#level5-6">Level 5 to 6</a></li>
  <li><a href="{{ page.url }}#level6-7">Level 6 to 7</a></li>
  <li><a href="{{ page.url }}#level7-8">Level 7 to 8</a></li>
  <li><a href="{{ page.url }}#level8-9">Level 8 to 9</a></li>
  <li><a href="{{ page.url }}#level9-10">Level 9 to 10</a></li>
  <li><a href="{{ page.url }}#level10-11">Level 10 to 11</a></li>
  <li><a href="{{ page.url }}#level11-12">Level 11 to 12</a></li>
  <li><a href="{{ page.url }}#level12-13">Level 12 to 13</a></li>
  <li><a href="{{ page.url }}#level13-14">Level 13 to 14</a></li>
  <li><a href="{{ page.url }}#level14-15">Level 14 to 15</a></li>
  <li><a href="{{ page.url }}#level15-16">Level 15 to 16</a></li>
  <li><a href="{{ page.url }}#level16-17">Level 16 to 17</a></li>
  <li><a href="{{ page.url }}#level17-18">Level 17 to 18</a></li>
  <li><a href="{{ page.url }}#level18-19">Level 18 to 19</a></li>
  <li><a href="{{ page.url }}#level19-20">Level 19 to 20</a></li>
</ul>

## Level 1 to 2 {#level1-2}
[back_top]({{ page.url }}#level)

### soal:
Password untuk level selanjutnya disimpan dalam sebuah file yang bernama - yang terletak di direktori home pengguna.

### solve:
Pada level 2 ke 3, kita diminta untuk membaca file yang bernama - di direktori home pengguna. Nama file ini menggunakan karakter spesial (-), yang bisa membingungkan sistem operasi karena digunakan sebagai tanda opsi dalam banyak perintah di Linux.

Untuk membaca file tersebut, kita bisa menggunakan perintah berikut:
```bash
cat < -
```
Di sini, simbol < digunakan untuk melakukan input redirection, yang artinya kita mengambil input dari file yang disebutkan setelah tanda <.

Alternatif lain adalah dengan menggunakan perintah ini:
```bash
cat ./-
```
Dengan menambahkan ./ di depan nama file, kita memberi tahu sistem untuk membaca file yang terletak di direktori saat ini, meskipun nama file tersebut mengandung karakter spesial seperti -. \
Metode ini memungkinkan kita untuk mengakses dan membaca file dengan nama yang tidak biasa atau menggunakan karakter spesial di Linux.

## Level 2 to 3 {#level2-3}
[back_top]({{ page.url }}#level)

### soal:
Password untuk level berikutnya disimpan dalam sebuah file yang bernama spaces in this filename, yang terletak di direktori home pengguna.

### solve:
Pada level 3 ke 4, kita diminta untuk membaca file yang bernama spaces in this filename yang berada di direktori home pengguna.

Untuk membaca file tersebut, kita bisa menggunakan tanda kutip tunggal (') di sekitar nama file yang mengandung spasi, seperti ini:
```bash
cat 'spaces in this filename'
```

Alternatif lain adalah dengan menggunakan karakter escape (\) untuk setiap spasi dalam nama file, seperti ini:
```bash
cat spaces\ in\ this\ filename
```

Selain itu, kita juga bisa membaca file tersebut dengan cara yang sama menggunakan perintah ./, seperti berikut, dan memanfaatkan fitur autocompletion dengan tombol Tab:
```bash
cat ./spaces\ in\ this\ filename
```

## Level 3 to 4 {#level3-4}
[back_top]({{ page.url }}#level)

## Level 4 to 5 {#level4-5}
[back_top]({{ page.url }}#level)

## Level 5 to 6 {#level5-6}
[back_top]({{ page.url }}#level)

## Level 6 to 7 {#level6-7}
[back_top]({{ page.url }}#level)

## Level 7 to 8 {#level7-8}
[back_top]({{ page.url }}#level)

## Level 8 to 9 {#level8-9}
[back_top]({{ page.url }}#level)

## Level 9 to 10 {#level9-10}
[back_top]({{ page.url }}#level)

## Level 10 to 11 {#level10-11}
[back_top]({{ page.url }}#level)

## Level 11 to 12 {#level11-12}
[back_top]({{ page.url }}#level)

## Level 12 to 13 {#level12-13}
[back_top]({{ page.url }}#level)

## Level 13 to 14 {#level13-14}
[back_top]({{ page.url }}#level)

## Level 14 to 15 {#level14-15}
[back_top]({{ page.url }}#level)

## Level 15 to 16 {#level15-16}
[back_top]({{ page.url }}#level)

## Level 16 to 17 {#level16-17}
[back_top]({{ page.url }}#level)

## Level 17 to 18 {#level17-18}
[back_top]({{ page.url }}#level)

## Level 18 to 19 {#level18-19}
[back_top]({{ page.url }}#level)

## Level 19 to 20 {#level19-20}
[back_top]({{ page.url }}#level)
