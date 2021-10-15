class Housenka {
  constructor() {
    this.session = null;
    this.xsize = 41;
    this.ysize = 31;
    this.rychlost = 100;
    this.zradlo_pocatek = 10;
    this.zradlo_za_klic = 6;
    this.klicu_v_levelu = 1;
    this.cena_klice = 5;
    this.bodu_za_zradlo_orig = 1;
    this.bodu_za_klic = 10;
    this.bodu_za_level = 100;
    this.navysit_zradlo_za_klic = 1; // prirustek kazdy level
    this.zrychleni = 0.8;
    this.levels = 24;
    this.lives = 3;

    this.level = 1;
    this.bodu_za_zradlo = this.bodu_za_zradlo_orig;
    this.plocha = new Array();
    this.povolena_zmena_smeru = 1;
    this.score = 0;
    this.obsahy = new Array(
      "prazdne",
      "telicko",
      "zradlo",
      "zed",
      "klic",
      "dvere",
      "hlavicka"
    );
    this.zradla_k_dispozici = 0;
    this.telicko = new Array();
    this.klavesy = new Array();
    this.nastav_smer = new Array(39, 40, 37, 38);
    this.smer = 0; // 0 vpravo, pak po smeru
    this.timer;
    this.hlaska = "";
    this.klicu = 0;
    this.ulozeno_na_klice = 0;
    this.klic_na_scene = false;
    this.dvere_na_scene = false;
    this.startuj_hru = 1;
    this.score_na_zacatku_levelu = 0;
    this.ridkost = false;

    this.housenkaIterator = 0;

    this.smery = new Array(1, 0, 0, 1, -1, 0, 0, -1);
    this.idx_smeru = new Array(0, 2, 4, 6);

    // messages
    this.klic24Msg = "kľúče";
    this.ajaxErrorMsg =
      "Bohužiaľ Váš prehliadač nedokázal na server odoslať dáta cez AJAX, kontaktujte, prosím, prevádzkovateľa systému.";
    this.live24Msg = "životy";
    this.klic5Msg = "kľúčov";
    this.point5Msg = "bodov";
    this.waitMsg = "Neostáva nič iné, len stránku refreshnúť...";
    this.klic1Msg = "kľúč";
    this.bludisteMsg = "bludisko";
    this.accelMsg =
      "Mačkohad prešiel už všetkými bludiskami, ktoré sme preňho pripravili. Tak to teraz skúsime trochu rýchlejšie, nie?";
    this.nextLevelMsg =
      "Mačkohad našiel cestu do ďalšieho bludiska, ktoré je však oveľa ťažšie. Mačkohada rozbehnete stlačením kurzorovej klávesy.";
    this.live5Msg = "životov";
    this.point1Msg = "bod";
    this.wormFailMsg =
      "Mačkohad nemôže jesť sám seba, našťastie ale máte ďalší život (vraciate sa na začiatok tohto bludiska).";
    this.keyGotMsg =
      "Mačkohad si naložil kľúč na seba, teraz musí opäť zbierať potravu a&nbsp;zosilnieť, aby uniesol ďalší kľúč.";
    this.startGameMsg =
      "Mačkohad sa rozbehne stlačením ľubovoľnej kurzorovej klávesy...";
    this.papejMsg =
      "Mačkohad potrebuje potravu, aby pekne rástol a&nbsp;mohol nájsť kľúče k&nbsp;dverám do ďalšieho bludiska.";
    this.keyAppearMsg =
      "Mačkohad je dosť silný na zoberanie jedného z&nbsp;kľúčov od dverí k&nbsp;ďalšiemu bludisku, rýchlo pre neho.";
    this.wallFailMsg =
      "Náraz do steny mačkohada dosť bolí, našťastie ale máte ďalší život (vraciate sa na začiatok tohto bludiska).";
    this.point24Msg = "body";
    this.doorMsg =
      "Mačkohad má už všetky kľúče od dverí do ďalšieho bludiska, ponáhľajme sa teda k&nbsp;nim.";
    this.live1Msg = "život";
    this.pauseMsg =
      "Mačkohad chvíľu odpočíva, rozbehnete ju opäť stlačením kurzorovej klávesy.";
    this.housenkaInit = this.housenkaInit.bind(this);
    this.zastavHru = this.zastavHru.bind(this);
    this.novaHra = this.novaHra.bind(this);
    this.doplnZradlo = this.doplnZradlo.bind(this);
    this.volnePole = this.volnePole.bind(this);
    this.vygenerujKlic = this.vygenerujKlic.bind(this);
    this.vyresKlice = this.vyresKlice.bind(this);
    this.koncime = this.koncime.bind(this);
    this.vygenerujDvere = this.vygenerujDvere.bind(this);
    this.odbarviHlavu = this.odbarviHlavu.bind(this);
    this.existujePole = this.existujePole.bind(this);
    this.vymazPlochu = this.vymazPlochu.bind(this);
    this.vymazHousenku = this.vymazHousenku.bind(this);
    this.zastavHousenku = this.zastavHousenku.bind(this);
    this.rozpohybujHousenku = this.rozpohybujHousenku.bind(this);
    this.pohybHousenky = this.pohybHousenky.bind(this);
    this.narustHousenky = this.narustHousenky.bind(this);
    this.addLife = this.addLife.bind(this);
    this.dalsiLevel = this.dalsiLevel.bind(this);
    this.stiskKlavesy = this.stiskKlavesy.bind(this);
    this.uvolneniKlavesy = this.uvolneniKlavesy.bind(this);
    this.vygenerujLevel = this.vygenerujLevel.bind(this);
    this.ridka_zed = this.ridka_zed.bind(this);
    this.zed_poly = this.zed_poly.bind(this);
    this.zed_full = this.zed_full.bind(this);
    this.zed = this.zed.bind(this);
    this.coords = this.coords.bind(this);
    this.reverse_coords = this.reverse_coords.bind(this);
    this.cihla = this.cihla.bind(this);
    this.nastavBarvu = this.nastavBarvu.bind(this);

    // callbacks
    this.show_result = function () {};
    this.show_score = function () {};
    this.show_klice = function () {};
    this.show_level = function () {};
    this.show_zivoty = function () {};
    this.callFinish = function () {};
    this.paint = function () {};
  }

  housenkaInit(reset) {
    var x, y;

    if (reset) {
      this.zradla_k_dispozici = this.zradlo_pocatek;
      this.lives = 3;
      this.score = 0;
      this.startuj_hru = 1;
      this.klavesy = [];
    }

    for (var y = 0; y < this.ysize; y++) {
      for (var x = 0; x < this.xsize; x++) {
        this.plocha[this.coords(x, y)] = 0;
      }
    }

    this.hlaska = this.papejMsg;

    this.show_result(this.startGameMsg);
    this.novaHra();
  }

  zastavHru(reason) {
    this.zastavHousenku();

    this.show_result(this.waitMsg);
    this.callFinish(this.score, this.reason);

    this.score = 0;
  }

  novaHra() {
    this.zastavHousenku();
    this.vymazHousenku();
    this.vymazPlochu();

    this.klicu = 0;
    this.bodu_za_zradlo = this.bodu_za_zradlo_orig;
    this.ulozeno_na_klice = 0;
    this.klic_na_scene = false;
    this.dvere_na_scene = false;

    var informace = this.vygenerujLevel();

    this.smer = informace[0];
    var x = informace[1];
    var y = informace[2];

    var kam = (this.smer + 2) % this.idx_smeru.length;
    var p = Number(this.idx_smeru[kam]);
    var prdylka_x = x + this.smery[p];
    var prdylka_y = y + this.smery[p + 1];

    this.narustHousenky(this.coords(prdylka_x, prdylka_y), false);
    this.narustHousenky(this.coords(x, y), true);

    this.show_score(this.score, this.topScore);
    this.show_klice(this.klicu);
    this.show_level(this.level, this.topLevel);
    this.show_zivoty(this.lives);

    this.doplnZradlo(this.zradlo_pocatek, -1);
  }

  doplnZradlo(kolik, nesmi_byt) {
    var i;
    for (i = 0; i < kolik; i++) {
      var pole = this.volnePole(nesmi_byt);

      this.nastavBarvu(this.coords(pole[0], pole[1]), 2);
      ++this.zradla_k_dispozici;
    }
  }

  volnePole(nesmi_byt) {
    do {
      var x = Math.floor(Math.random() * this.xsize);
      var y = Math.floor(Math.random() * this.ysize);
    } while (
      this.plocha[this.coords(x, y)] != 0 ||
      this.coords(x, y) == nesmi_byt
    );

    return new Array(x, y);
  }

  vygenerujKlic(nesmi_byt) {
    var pole = this.volnePole(nesmi_byt);

    this.nastavBarvu(this.coords(pole[0], pole[1]), 4);
    this.klic_na_scene = true;
    this.ulozeno_na_klice -= this.cena_klice;

    ++this.bodu_za_zradlo;

    this.show_klice(this.klicu);
    this.doplnZradlo(this.zradlo_za_klic, nesmi_byt);
    this.show_result(this.keyAppearMsg);
  }

  vyresKlice(nesmi_byt) {
    if (this.klic_na_scene || this.dvere_na_scene) return;
    if (this.ulozeno_na_klice >= this.cena_klice) this.vygenerujKlic(nesmi_byt);
  }

  koncime(reason) {
    --this.lives;
    if (this.lives > 0) {
      this.score = this.score_na_zacatku_levelu;
      this.novaHra();
      this.startuj_hru = 1;
      if (reason == "worm") this.hlaska = this.wormFailMsg;
      else this.hlaska = this.wallFailMsg;
      this.show_result(this.hlaska);
    } else this.zastavHru(reason);
  }

  vygenerujDvere(nesmi_byt) {
    var pole = this.volnePole(nesmi_byt);

    this.dvere_na_scene = true;
    this.nastavBarvu(this.coords(pole[0], pole[1]), 5);
    this.doplnZradlo(this.zradlo_za_klic, nesmi_byt);

    this.show_result(this.doorMsg);
  }

  odbarviHlavu() {
    this.nastavBarvu(this.telicko[0], 1);
  }

  existujePole(x, y) {
    return x >= 0 && y >= 0 && x < this.xsize && y < this.ysize;
  }

  vymazPlochu() {
    var i;
    for (i in this.plocha) {
      this.nastavBarvu(i, 0);
    }
  }

  vymazHousenku() {
    while (this.telicko.length > 0) {
      this.nastavBarvu(this.telicko.pop(), 0);
    }
  }

  zastavHousenku() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  rozpohybujHousenku() {
    if (this.timer) this.zastavHousenku();
    this.timer = setTimeout(this.pohybHousenky, this.rychlost);
  }

  pohybHousenky() {
    var smer_x = this.smery[Number(this.idx_smeru[this.smer])];
    var smer_y = this.smery[Number(this.idx_smeru[this.smer]) + 1];
    var xsize = this.xsize;
    var ysize = this.ysize;

    var hlavicka = this.reverse_coords(this.telicko[0]);

    smer_x += hlavicka[0];
    smer_y += hlavicka[1];

    if (smer_x >= xsize) smer_x -= xsize;
    if (smer_y >= ysize) smer_y -= ysize;
    if (smer_x < 0) smer_x += xsize;
    if (smer_y < 0) smer_y += ysize;

    var narust = 0;
    var nova_pozice = this.coords(smer_x, smer_y);
    if (this.plocha[nova_pozice] == 2) {
      // zradlo
      this.score += this.bodu_za_zradlo;
      this.topScore = Math.max(this.score, this.topScore);
      ++this.ulozeno_na_klice;
      this.show_score(this.score, this.topScore);
      this.vyresKlice(nova_pozice);
      --this.zradla_k_dispozici;
      ++narust;
      this.nastavBarvu(nova_pozice, 0);
    } else if (this.plocha[nova_pozice] == 4) {
      // klic
      ++this.klicu;
      this.show_klice(this.klicu);
      this.klic_na_scene = false;
      this.nastavBarvu(nova_pozice, 0);

      this.score += this.bodu_za_klic;
      this.topScore = Math.max(this.score, this.topScore);
      this.show_score(this.score, this.topScore);

      this.show_result(this.keyGotMsg);

      ++narust;

      if (this.klicu == this.klicu_v_levelu) this.vygenerujDvere(nova_pozice);
      else this.vyresKlice(nova_pozice);
    } else if (this.plocha[nova_pozice] == 5) {
      // dvere
      this.dalsiLevel();
      return;
    }

    if (this.plocha[nova_pozice] == 0) {
      this.odbarviHlavu();
      this.narustHousenky(nova_pozice, true);
      this.povolena_zmena_smeru = 1;
      if (!narust) this.nastavBarvu(this.telicko.pop(), 0);
      this.rozpohybujHousenku();
    } else if (this.plocha[nova_pozice] == 1) this.koncime("worm");
    else this.koncime("wall");
  }

  narustHousenky(pozice, hlavicka) {
    this.telicko.unshift(pozice);
    if (hlavicka) {
      this.nastavBarvu(pozice, 6);
    } else {
      this.nastavBarvu(pozice, 1);
    }
  }

  addLife() {
    this.lives++;
    this.show_zivoty(this.lives);
  }

  dalsiLevel() {
    ++this.level;
    this.topLevel = Math.max(this.level, this.topLevel);
    this.score += this.level * this.bodu_za_level;
    this.score_na_zacatku_levelu = this.score;

    this.zradlo_za_klic += this.navysit_zradlo_za_klic;

    this.hlaska = this.nextLevelMsg;
    this.novaHra();
    this.show_result(this.hlaska);

    this.startuj_hru = 1;
  }

  stiskKlavesy(e) {
    var udalost = e;

    this.klavesy[udalost.keyCode] = true;

    if (this.startuj_hru) {
      this.rozpohybujHousenku();
      this.startuj_hru = 0;
      this.show_result(this.hlaska);
    }

    var obslouzena = false;
    var klavesa;
    for (klavesa in this.nastav_smer)
      if (this.nastav_smer[klavesa] == udalost.keyCode) {
        if (this.smer % 2 != klavesa % 2 && this.povolena_zmena_smeru) {
          this.smer = klavesa;
          this.povolena_zmena_smeru = 0;
        }
        obslouzena = true;
      }

    if (udalost.keyCode == 27) {
      // esc
      obslouzena = true;
      this.zastavHru("user");
    } else if (udalost.keyCode == 80) {
      // P
      obslouzena = true;
      this.zastavHousenku();
      this.tartuj_hru = 1;
      this.show_result(this.pauseMsg);
    }

    return !obslouzena;
  }

  uvolneniKlavesy(e) {
    var udalost = e;
    this.klavesy[udalost.keyCode] = false;
  }

  vygenerujLevel() {
    var results = new Array(0, 0, 0);
    var xsize = this.xsize;
    var ysize = this.ysize;

    var mujlevel = this.level - 1;
    if (mujlevel > this.levels) {
      mujlevel = mujlevel % levels;
      if (mujlevel == 0) Math.floor((rychlost *= zrychleni));
      if (rychlost < 1) rychlost = 1;
      hlaska = accelMsg;
    }

    results[1] = Math.floor(xsize / 2);
    results[2] = Math.floor(ysize / 2);

    this.zed_poly(
      new Array(0, 0, xsize - 1, 0, xsize - 1, ysize - 1, 0, ysize - 1, 0, 0)
    );

    if (mujlevel == 1) {
      this.zed(
        Math.floor(xsize / 4),
        Math.floor(ysize / 2),
        Math.floor((3 * xsize) / 4),
        Math.floor(ysize / 2)
      );
      results[2] += 3;
    } else if (mujlevel == 2) {
      this.zed(Math.floor(xsize / 4), 4, Math.floor(xsize / 4), ysize - 5);
      this.zed(
        Math.floor((3 * xsize) / 4),
        4,
        Math.floor((3 * xsize) / 4),
        ysize - 5
      );
    } else if (mujlevel == 3) {
      this.zed(4, Math.floor(ysize / 2), xsize - 5, Math.floor(ysize / 2));
      this.zed(Math.floor(xsize / 2), 4, Math.floor(xsize / 2), ysize - 5);
      results[1] += 5;
      results[2] += 5;
    } else if (mujlevel == 4) {
      var x;
      for (x = 8; x < xsize; x += 8) this.zed(x, 0, x, ysize - 7);
      results[0] = 1;
    } else if (mujlevel == 5) {
      var suda = false;
      var x;
      for (x = 8; x < xsize; x += 8) {
        if (suda) this.zed(x, 6, x, ysize - 1);
        else this.zed(x, 0, x, ysize - 7);
        suda = !suda;
      }
      results[0] = 3;
    } else if (mujlevel == 6) {
      var x;
      for (x = 8; x < xsize; x += 8) {
        this.zed(x, 0, x, Math.floor(ysize / 2) - 3);
        this.zed(x, Math.floor(ysize / 2) + 3, x, ysize - 1);
      }
    } else if (mujlevel == 7) {
      var suda = false;
      var y;
      for (y = 6; y < ysize; y += 6) {
        if (suda) this.zed(6, y, xsize - 1, y);
        else this.zed(0, y, xsize - 7, y);
        suda = !suda;
      }
    } else if (mujlevel == 8) {
      var y;
      for (y = 6; y < ysize; y += 6) {
        this.zed(0, y, Math.floor(xsize / 2) - 4, y);
        this.zed(Math.floor(xsize / 2) + 4, y, xsize - 1, y);
      }
    } else if (mujlevel == 9) {
      this.zed(
        Math.floor(xsize / 4) + 1,
        6,
        Math.floor((3 * xsize) / 4) - 1,
        6
      );
      this.zed(
        Math.floor(xsize / 4) + 1,
        ysize - 7,
        Math.floor((3 * xsize) / 4) - 1,
        ysize - 7
      );
      this.zed(
        Math.floor(xsize / 4) - 1,
        8,
        Math.floor(xsize / 4) - 1,
        ysize - 9
      );
      this.zed(
        Math.floor((3 * xsize) / 4) + 1,
        8,
        Math.floor((3 * xsize) / 4) + 1,
        ysize - 9
      );
    } else if (mujlevel == 10) {
      var i;
      for (i = 0; i < 2; i++) {
        var n = 3 * i + 1;
        this.zed(
          Math.floor((n * xsize) / 7) + 1,
          6,
          Math.floor(((n + 2) * xsize) / 7) - 1,
          6
        );
        this.zed(
          Math.floor((n * xsize) / 7) + 1,
          ysize - 7,
          Math.floor(((n + 2) * xsize) / 7) - 1,
          ysize - 7
        );
        this.zed(
          Math.floor((n * xsize) / 7) - 1,
          8,
          Math.floor((n * xsize) / 7) - 1,
          ysize - 9
        );
        this.zed(
          Math.floor(((n + 2) * xsize) / 7) + 1,
          8,
          Math.floor(((n + 2) * xsize) / 7) + 1,
          ysize - 9
        );
      }
      results[0] = 1;
    } else if (mujlevel == 11) {
      var i;
      for (i = 0; i < 2; i++) {
        this.zed(
          Math.floor(xsize / 4) + 1 + 4 * i,
          6 + 4 * i,
          Math.floor((3 * xsize) / 4) - 1 - 4 * i,
          6 + 4 * i
        );
        this.zed(
          Math.floor(xsize / 4) + 1 + 4 * i,
          ysize - 7 - 4 * i,
          Math.floor((3 * xsize) / 4) - 1 - 4 * i,
          ysize - 7 - 4 * i
        );
        this.zed(
          Math.floor(xsize / 4) - 1 + 4 * i,
          8 + 4 * i,
          Math.floor(xsize / 4) - 1 + 4 * i,
          ysize - 9 - 4 * i
        );
        this.zed(
          Math.floor((3 * xsize) / 4) + 1 - 4 * i,
          8 + 4 * i,
          Math.floor((3 * xsize) / 4) + 1 - 4 * i,
          ysize - 9 - 4 * i
        );
      }
    } else if (mujlevel == 12) {
      this.zed(
        Math.floor(xsize / 6),
        Math.floor(ysize / 4),
        Math.floor((5 * xsize) / 6),
        Math.floor((3 * ysize) / 4)
      );
      this.zed(
        Math.floor(xsize / 6),
        Math.floor((3 * ysize) / 4),
        Math.floor((5 * xsize) / 6),
        Math.floor(ysize / 4)
      );
      this.zed_full(
        Math.floor(xsize / 2) - 2,
        Math.floor(ysize / 2) - 1,
        Math.floor(xsize / 2) + 2,
        Math.floor(ysize / 2) + 1
      );
      results[2] += 10;
    } else if (mujlevel == 13) {
      this.zed(
        Math.floor(xsize / 6),
        Math.floor(ysize / 4),
        Math.floor((5 * xsize) / 6),
        Math.floor((3 * ysize) / 4)
      );
      this.zed(
        Math.floor(xsize / 6),
        Math.floor((3 * ysize) / 4),
        Math.floor((5 * xsize) / 6),
        Math.floor(ysize / 4)
      );
      this.zed(
        Math.floor(xsize / 2),
        Math.floor(ysize / 6),
        Math.floor(xsize / 2),
        Math.floor((5 * ysize) / 6)
      );
      this.zed_full(
        Math.floor(xsize / 2) - 2,
        Math.floor(ysize / 2) - 1,
        Math.floor(xsize / 2) + 2,
        Math.floor(ysize / 2) + 1
      );
      results[1] += 5;
      results[2] += 10;
    } else if (mujlevel == 14) {
      this.zed(
        0,
        Math.floor(ysize / 4),
        Math.floor(xsize / 2),
        Math.floor((2 * ysize) / 3)
      );
      this.zed(
        xsize - 1,
        Math.floor((3 * ysize) / 4),
        Math.floor(xsize / 2),
        Math.floor(ysize / 3)
      );
    } else if (mujlevel == 15) {
      this.zed(
        0,
        Math.floor(ysize / 4),
        Math.floor(xsize / 3),
        Math.floor((2 * ysize) / 3)
      );
      this.zed(
        xsize - 1,
        Math.floor((3 * ysize) / 4),
        Math.floor((2 * xsize) / 3),
        Math.floor(ysize / 3)
      );
      this.zed(
        Math.floor((3 * xsize) / 4),
        0,
        Math.floor(xsize / 3),
        Math.floor(ysize / 3) + 1
      );
      this.zed(
        Math.floor(xsize / 4),
        ysize - 1,
        Math.floor((2 * xsize) / 3),
        Math.floor((2 * ysize) / 3) - 1
      );
      cihla(Math.floor(xsize / 4) + 3, ysize - 2);
      cihla(Math.floor((3 * xsize) / 4) - 3, 1);
      cihla(1, Math.floor(ysize / 4) + 2);
      cihla(xsize - 2, Math.floor((3 * ysize) / 4) - 2);
    } else if (mujlevel == 16) {
      this.zed(
        Math.floor(xsize / 4) + 1,
        Math.floor(ysize / 2) - 1,
        Math.floor(xsize / 2) - 1,
        6
      );
      this.zed(
        Math.floor((3 * xsize) / 4) - 1,
        Math.floor(ysize / 2) - 1,
        Math.floor(xsize / 2) + 1,
        6
      );
      this.zed(
        Math.floor((3 * xsize) / 4) - 1,
        Math.floor(ysize / 2) + 1,
        Math.floor(xsize / 2) + 1,
        ysize - 7
      );
      this.zed(
        Math.floor(xsize / 4) + 1,
        Math.floor(ysize / 2) + 1,
        Math.floor(xsize / 2) - 1,
        ysize - 7
      );
    } else if (mujlevel == 17) {
      this.ridka_zed(
        Math.floor(xsize / 2),
        0,
        Math.floor(xsize / 2),
        ysize - 1
      );
      results[1] += 3;
    } else if (mujlevel == 18) {
      var suda = false;
      var x;
      for (x = 8; x < xsize; x += 8) {
        if (suda) this.ridka_zed(x, 0, x, ysize - 1);
        else this.ridka_zed(x, 1, x, ysize - 1);
        suda = !suda;
      }
      results[0] = 3;
    } else if (mujlevel == 19) {
      this.zed(2, Math.floor(ysize / 2), xsize - 3, Math.floor(ysize / 2));
      results[2] += 3;
    } else if (mujlevel == 20) {
      this.zed(2, Math.floor(ysize / 2), xsize - 3, Math.floor(ysize / 2));
      this.zed(Math.floor(xsize / 2), 2, Math.floor(xsize / 2), ysize - 3);
      results[1] += 5;
      results[2] += 5;
    } else if (mujlevel == 21) {
      this.zed(2, Math.floor(ysize / 2), xsize - 3, Math.floor(ysize / 2));
      var x;
      for (x = 1; x <= 3; x++)
        this.zed(
          Math.floor((x * xsize) / 4),
          2,
          Math.floor((x * xsize) / 4),
          ysize - 3
        );
      results[1] += 5;
      results[2] += 5;
      results[0] = 1;
    } else if (mujlevel == 22) {
      var suda = false;
      var x;
      for (x = 8; x < xsize; x += 8) {
        if (suda) this.zed(x, 2, x, ysize - 1);
        else this.zed(x, 0, x, ysize - 3);
        suda = !suda;
      }
      results[0] = 3;
    } else if (mujlevel == 23) {
      var i;
      for (i = 0; i < 2; i++) {
        var n = 3 * i + 1;
        this.zed(
          Math.floor((n * xsize) / 7) + 1,
          3 + i * Math.floor(ysize / 2),
          Math.floor(((n + 2) * xsize) / 7) - 1,
          3 + i * Math.floor(ysize / 2)
        );
        this.zed(
          Math.floor((n * xsize) / 7) + 1,
          Math.floor(ysize / 2) - 3 + i * Math.floor(ysize / 2),
          Math.floor(((n + 2) * xsize) / 7) - 1,
          Math.floor(ysize / 2) - 3 + i * Math.floor(ysize / 2)
        );
        this.zed(
          Math.floor((n * xsize) / 7) - 1,
          5 + i * Math.floor(ysize / 2),
          Math.floor((n * xsize) / 7) - 1,
          Math.floor(ysize / 2) - 5 + i * Math.floor(ysize / 2)
        );
        this.zed(
          Math.floor(((n + 2) * xsize) / 7) + 1,
          5 + i * Math.floor(ysize / 2),
          Math.floor(((n + 2) * xsize) / 7) + 1,
          Math.floor(ysize / 2) - 5 + i * Math.floor(ysize / 2)
        );

        n = 3 * ((i + 1) % 2) + 1;

        this.zed(
          Math.floor((n * xsize) / 7) + 1,
          Math.floor(ysize / 2) - 3 + i * Math.floor(ysize / 2),
          Math.floor(((n + 2) * xsize) / 7) - 1,
          Math.floor(ysize / 2) - 3 + i * Math.floor(ysize / 2)
        );
        this.zed(
          Math.floor(((n + 1) * xsize) / 7) - 1,
          4 + i * Math.floor(ysize / 2),
          Math.floor((n * xsize) / 7) - 1,
          Math.floor(ysize / 2) - 5 + i * Math.floor(ysize / 2)
        );
        this.zed(
          Math.floor(((n + 1) * xsize) / 7) + 1,
          4 + i * Math.floor(ysize / 2),
          Math.floor(((n + 2) * xsize) / 7) + 1,
          Math.floor(ysize / 2) - 5 + i * Math.floor(ysize / 2)
        );
        cihla(
          Math.floor((n * xsize) / 7) - 1,
          Math.floor(ysize / 2) - 4 + i * Math.floor(ysize / 2)
        );
        cihla(
          Math.floor(((n + 2) * xsize) / 7) + 1,
          Math.floor(ysize / 2) - 4 + i * Math.floor(ysize / 2)
        );
      }
    }

    return results;
  }

  ridka_zed(x1, y1, x2, y2) {
    this.ridkost = true;
    this.zed(x1, y1, x2, y2);
    this.ridkost = false;
  }

  zed_poly(useky) {
    var last_x = useky[0];
    var last_y = useky[1];
    var i;
    for (i = 2; i < useky.length; i += 2) {
      var x = useky[i];
      var y = useky[i + 1];
      this.zed(last_x, last_y, x, y);
      last_x = x;
      last_y = y;
    }
  }

  zed_full(x1, y1, x2, y2) {
    if (y1 > y2) {
      var p = y1;
      y1 = y2;
      y2 = p;
    }

    var y;
    for (y = y1; y <= y2; y++) this.zed(x1, y, x2, y);
  }

  zed(x1, y1, x2, y2) {
    var steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
    if (steep) {
      var p = x1;
      x1 = y1;
      y1 = p;
      p = x2;
      x2 = y2;
      y2 = p;
    }
    if (x1 > x2) {
      var p = x1;
      x1 = x2;
      x2 = p;
      p = y1;
      y1 = y2;
      y2 = p;
    }

    var dx = x2 - x1;
    var dy = y2 - y1;

    var slope;
    if (dy < 0) {
      slope = -1;
      dy = -dy;
    } else {
      slope = 1;
    }

    var incE = 2 * dy;
    var incNE = 2 * dy - 2 * dx;
    var d = 2 * dy - dx;
    var y = y1;
    var x;
    var ted_jo = true;

    for (x = x1; x <= x2; x++) {
      if (ted_jo)
        if (steep) this.cihla(y, x);
        else this.cihla(x, y);
      if (d <= 0) d += incE;
      else {
        d += incNE;
        y += slope;
      }
      if (this.ridkost) ted_jo = !ted_jo;
    }
  }

  coords(x, y) {
    return y * this.xsize + x;
  }

  reverse_coords(pozice) {
    var x = pozice % this.xsize;
    var y = Math.floor(pozice / this.xsize);

    return new Array(x, y);
  }

  cihla(x, y) {
    this.nastavBarvu(this.coords(x, y), 3);
  }

  nastavBarvu(pozice, barva) {
    this.plocha[pozice] = barva;

    this.paint(this.plocha, this.smer);
  }
}

module.exports = Housenka;
