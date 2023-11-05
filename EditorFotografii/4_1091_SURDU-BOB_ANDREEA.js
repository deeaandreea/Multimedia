let canvas, context, W, H, offsetX, offsetY;
let img = null;
let selX1 = 0, selY1 = 0, selX2 = 0, selY2 = 0; // coordonate zona selectata
let inSelectie = false, selectat = false;
let modLucru = 'selectie'; // modLucru va fi 'text' pentru adaugare de text
let checkboxHistograma;

document.addEventListener('DOMContentLoaded', aplicatie);

function aplicatie() {
    canvas = document.querySelector('#desen');
    context = canvas.getContext('2d');
    W = canvas.width;
    H = canvas.height;
    offsetX = canvas.getBoundingClientRect().left;
    offsetY = canvas.getBoundingClientRect().top;

    // Incarcare imagine din fisier local
    incarcareImagine('media/Andreea.jpg');

    // Incarcare imagine folosind control input de tip 'file'
    let btnSelectFile = document.querySelector('#selectFisier');
    btnSelectFile.addEventListener('change', e => {
        let inputFile = document.querySelector('#selectFisier');
        let fisier = inputFile.files[0];
        incarcareImagineFisier(fisier);
    });

    // Incarcare imagine prin drag and drop
    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', e => {
        e.preventDefault();
        let file = e.dataTransfer.files[0];
        incarcareImagineFisier(file);
    });

    // Salvare imagine in fisier
    let btnSave = document.querySelector('#btnSave');
    btnSave.addEventListener('click', salvareImagineInFisier);

    // Crop pentru zona selectata din imagine
    let btnCrop = document.querySelector('#btnCrop');
    btnCrop.addEventListener('click', cropImagine);

    // Aplicare efect ales pe zona selectata din imagine
    let btnEfect = document.querySelector('#btnEffect');
    btnEfect.addEventListener('click', aplicareEfect);

    // Selectie zona imagine
    canvas.addEventListener('mousedown', e => onMouseDown(e.layerX, e.layerY));
    canvas.addEventListener('mousemove', e => onMouseMove(e.layerX, e.layerY));
    canvas.addEventListener('mouseup', e => onMouseUp(e.layerX, e.layerY));

    // Scalare imagine
    let lungime = document.querySelector('#lungime');
    lungime.addEventListener('change', e => modificaLatime(e.target.value));
    let latime = document.querySelector('#latime');
    latime.addEventListener('change', e => modificaLungime(e.target.value));
    let btnScale = document.querySelector('#btnScale');
    btnScale.addEventListener('click', scalareImagine);

    // Stergere selectie
    let btnClear = document.querySelector('#btnClear');
    btnClear.addEventListener('click', stergereSelectie);

    // Adaugare text
    // La apasarea butonului 'Adauga text' este setat modul de lucru 'text'
    // La click pe canvas este adaugat textul pe imagine in punctul de click
    let btnText = document.querySelector('#btnText');
    btnText.addEventListener('click', e => modLucru = 'text');
    canvas.addEventListener('click', e => adaugareText(e.layerX, e.layerY));

    // Input de tip checkbox, folosit pentru afisarea histogramei zonei selectate
    checkboxHistograma = document.querySelector('#histograma');
}

function incarcareImagine(sursa) {
    img = document.createElement('img');
    img.src = sursa;
    img.addEventListener('load', desenare);
}

function incarcareImagineFisier(fisier) {
    let fileReader = new FileReader();
    fileReader.readAsDataURL(fisier);
    fileReader.addEventListener('load', e => incarcareImagine(e.target.result));
}

function salvareImagineInFisier() {
    let a = document.createElement('a');
    a.download = 'imagine.jpg';
    a.href = canvas.toDataURL('image/jpeg', 0.9);
    a.click();
}

function desenare() {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    W = canvas.width, H = canvas.height;

    context.drawImage(img, 0, 0);

    // Afisare dimensiuni imagine in cele 2 input de tip text: lungime, latime
    let lung = document.querySelector('#lungime');
    lung.value = W.toFixed(2);
    let lat = document.querySelector('#latime');
    lat.value = H.toFixed(2);
}

function cropImagine() {
    restaurareImagine();
    let selX = Math.min(selX1, selX2);
    let selY = Math.min(selY1, selY2);
    let selW = Math.abs(selX2 - selX1);
    let selH = Math.abs(selY2 - selY1);
    let imageData = context.getImageData(selX, selY, selW, selH);
    console.log(selX1 + ',' + selY1 + ',' + selW + ',' + selH);

    canvas.width = selW, canvas.height = selH;
    W = canvas.width, H = canvas.height;

    context.putImageData(imageData, 0, 0);

    let lung = document.querySelector('#lungime');
    lung.value = W.toFixed(2);
    let lat = document.querySelector('#latime');
    lat.value = H.toFixed(2);

    actualizareImagine();
}

function scalareImagine() {
    // Citire dimensiuni noi imagine din cele 2 input de tip text: lungime, latime
    let lungime = document.querySelector('#lungime').value;
    let latime = document.querySelector('#latime').value;

    canvas.width = lungime, canvas.height = latime;
    W = canvas.width, H = canvas.height;

    let iW = img.naturalWidth, iH = img.naturalHeight;

    context.drawImage(img,
        /* Sursa - coordonate imagine */
        0, 0, iW, iH,
        /* Destinatie - coordonate canvas */ 
        0, 0, W, H
    );
}

/**
 * Modificarea valorii pentru latime in functie de valoarea lungimii
 * astfel incat sa se pastreze proportiile imaginii
 * @param {Number} lungime 
 */
function modificaLatime(lungime) {
    let f = W/H;
    let latime = document.querySelector('#latime');
    latime.value = Number(lungime/f).toFixed(2);
}

/**
 * Modificarea valorii pentru lungime in functie de valoarea latimii
 * astfel incat sa se pastreze proportiile imaginii
 * @param {Number} latime 
 */
function modificaLungime(latime) {
    let f = W/H;
    let lungime = document.querySelector('#lungime');
    lungime.value = Number(latime*f).toFixed(2);
}

/**
 * Functie pentru salvarea imaginii inainte si in timpul selectarii unei zone din imagine
 */
function salvareImagine() {
    img = context.getImageData(0, 0, W, H);
}

/**
 * Functie pentru restaurarea imaginii in timpul si dupa selectarea unei zone din imagine
 */
 function restaurareImagine() {
    context.putImageData(img, 0, 0);
}

/**
 * Functie pentru actualizarea imaginii in urma aplicarii unor modificari, cum ar fi: 
 * crop, aplicarea unuia dintre efectele de culoare, adaugare text sau steregere selectie
 */
function actualizareImagine() {
    incarcareImagine(canvas.toDataURL());
    selX1 = 0, selY1 = 0, selX2 = 0, selY2 = 0, inSelectie = false, selectat = false;
}

function onMouseDown(x, y) {
    if (modLucru !== 'selectie')
        return;

    // Daca exista deja o zona de imagine selectata, se sterge selectia anterioara
    // prin restaurarea imaginii salvate la inceperea acelei selectiei
    if (selectat === true) {
        restaurareImagine();
        selectat = false;
    }

    selX1 = x - offsetX;
    selY1 = y - offsetY;
    inSelectie = true;
    salvareImagine();
}

function onMouseMove(x, y) {
    // Coordonate mouse
    let mx = x - offsetX;
    let my = y - offsetY;
    // Modificare dreptunghi selectie pentru modul de lucru 'selectie'
    if (modLucru === 'selectie' && inSelectie === true) {
        restaurareImagine();
        context.strokeStyle = "black";
        context.setLineDash([6,3]);
        context.strokeRect(selX1, selY1, mx - selX1, my - selY1);

        if (checkboxHistograma.checked === true) {
            desenareHistograma(mx, my);
        }
    }
    // Modificare cursor dupa ce a fost selectata o zona din imagine
    // Cursorul 'move' este afisat doar in interiorul dreptunghiului de selectie,
    // in rest este afisat cursorul 'default'
    if (modLucru === 'selectie' && selectat === true) {
        let x1, x2, y1, y2;
        x1 = Math.min(selX1, selX2);
        x2 = Math.max(selX1, selX2);
        y1 = Math.min(selY1, selY2);
        y2 = Math.max(selY1, selY2);
        if (x1 < mx && mx < x2 && y1 < my && my < y2) {
            canvas.style.cursor = 'move';
        } else {
            canvas.style.cursor = 'default';
        }
    }
}
  
function onMouseUp(x, y) {
    if (modLucru !== 'selectie')
        return;
    selX2 = x - offsetX;
    selY2 = y - offsetY;

    restaurareImagine();
    // Marcare cu linie punctata alba a zonei selectate din imagine
    context.strokeStyle = "white";
    context.setLineDash([6,3]);
    context.strokeRect(selX1, selY1, selX2 - selX1, selY2 - selY1);

    inSelectie = false;
    selectat = true;

    if (checkboxHistograma.checked === true) {
        desenareHistograma(selX2, selY2);
    }
}

/**
 * Stergerea zonei selectate din imagine. Pixelii din selectie vor deveni albi.
 */
function stergereSelectie() {
    context.clearRect(selX1, selY1, selX2 - selX1, selY2 - selY1);
    context.strokeStyle = "white";
    context.setLineDash([]);
    context.strokeRect(selX1, selY1, selX2 - selX1, selY2 - selY1);
    actualizareImagine();
}

/**
 * Adauga in canvas textul completat de utilizator folosind culoarea si dimensiunea furnizate,
 * la coordonatele din pagina x, y 
 * @param {Number} x 
 * @param {Number} y 
 */
function adaugareText(x, y) {
    if (modLucru === 'text') {
        let textul = document.querySelector('#textul').value;
        if (textul != '') {
            let color = document.querySelector('#colorPicker').value;
            let size = document.querySelector('#fontSize').value;
            let xText = x - offsetX;
            let yText = y - offsetY;
            //context.textBaseline = 'middle';
            context.font = 'bold ' + size + 'pt Arial';
            context.fillStyle = color;
            context.fillText(textul, xText, yText);
        }
        modLucru = 'selectie';
        actualizareImagine();
    }
}

/**
 * Aplica efectul selectat pentru zona selectata din imagine.
 * Daca nu exista selectie, aplica efectul pe toata imaginea.
 */
 function aplicareEfect() {
    let selectEfect = document.querySelector('#selectEfect');
    let efect = selectEfect.options[selectEfect.selectedIndex].innerText;

    let x1 = 0, y1 = 0, x2 = W, y2 = H;
    if (selectat) {
        restaurareImagine();
        x1 = Math.min(selX1, selX2);
        x2 = Math.max(selX1, selX2);
        y1 = Math.min(selY1, selY2);
        y2 = Math.max(selY1, selY2);
    }

    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            let i = (y * W * 4) + x * 4;
            
            if (y1 <= y && y <= y2 && x1 <= x && x <= x2) {
                switch (efect) {
                    case 'Negativ':
                        negativ(data, i);
                        break;
                    case 'Tonuri gri':
                        tonuriGri(data, i);
                        break;
                    case 'Sepia':
                        sepia(data, i);
                        break;
                    case 'Modificare contrast':
                        modificareContrast(data, i, 0.7);
                        break;
                    case 'Modificare stralucire':
                        modificareStralucire(data, i, 30);
                        break;
                    case 'Albastru':
                        modificareAlbastru(data, i);
                        break;
                    case 'Inversare rosu-verde':
                        inversareRG(data, i);
                        break;
                }
            }
        }
    }
    context.putImageData(imageData, 0, 0);
    actualizareImagine();
}

function negativ(data, i) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
}

function tonuriGri(data, i) {
    const val = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    // const val = (data[i + 0] + data[i + 1] + data[i + 2])/3;
    data[i] = val
    data[i + 1] = val;
    data[i + 2] = val;
    return data;
}

function sepia(data, i) {
    let rosu = data[i], verde = data[i + 1], albastru = data[i + 2];
    data[i] = Math.min(Math.round(0.393 * rosu + 0.769 * verde + 0.189 * albastru), 255);
    data[i + 1] = Math.min(Math.round(0.349 * rosu + 0.686 * verde + 0.168 * albastru), 255);
    data[i + 2] = Math.min(Math.round(0.272 * rosu + 0.534 * verde + 0.131 * albastru), 255);
}

/**
 * Aplica limitele 0..255 pentru componenta culoare primita ca parametru
 * @param {Number} c - componenta culoare
 * @returns - noua valoare pentru componenta culoare
 */
function aplicaLimite(c) {
    if (c > 255)
        c = 255;
    else if (c < 0)
        c = 0;
    return c;
}

function modificareStralucire(data, i, val) {
    data[i] = aplicaLimite(data[i] + val);
    data[i+1] = aplicaLimite(data[i+1] + val);
    data[i+2] = aplicaLimite(data[i+2] + val);
    return data;
}

function modificareContrast(data, i, val) {
    data[i] = aplicaLimite(((data[i] / 255.0) * val + 0.5) * 255);
    data[i + 1] = aplicaLimite(((data[i + 1] / 255.0) * val + 0.5) * 255);
    data[i + 2] = aplicaLimite(((data[i + 2] / 255.0) * val + 0.5) * 255);
    return data;
}

/**
 * Seteaza pe valoarea maxima componenta de albastru a pixelului
 */
 function modificareAlbastru(data, i) {
    data[i+2] = 255;
}

/**
 * Inverseaza valorile componentelor de rosu si verde ale pixelului
 */
 function inversareRG(data, i) {
    let rosu = data[i];
    let verde = data[i+1];
    data[i] = verde;
    data[i+1] = rosu;
}

/**
 * Adaptare functie din exemple curs (06_histograma.html) pentru desenarea
 * histogramei pentru zona de imagine selectata
 * @param {Number} mx - coordonata mouse x
 * @param {Number} my - coordonata mouse y
 */
function desenareHistograma(mx, my) {
    let v = [];
    for (let i = 0; i < 256; i++) {
        v.push(0);
    }
    let x1 = Math.min(selX1, mx);
    let x2 = Math.max(selX1, mx);
    let y1 = Math.min(selY1, my);
    let y2 = Math.max(selY1, my);
    let w = x2 - x1, h = y2 - y1;
    let id = context.getImageData(x1, y1, w, h);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let i = (y * w * 4) + x * 4;
            let val = Math.round((id.data[i] + id.data[i + 1] + id.data[i + 2]) / 3);
            v[val]++;
        }
    }
    grafic(context, v, selX1, mx-selX1, H);    
}

/**
 * Adaptare functie din exemple curs (06_histograma.html) pentru desenarea 
 * graficului corepunzator histogramei pentru zona de imagine selectata
 * 
 * @param {CanvasRenderingContext2D} ctx - context canvas
 * @param {Array} v - vector [0..255] cu valorile de reprezentat
 * @param {Number} x - coordonata din imagine de la care se incepe histograma
 * @param {Number} W - lungimea imaginii
 * @param {Number} H - latimea imaginii
 */
function grafic(ctx, v, x, W, H) {
    ctx.save();
    let n = v.length;
    let f = H / Math.max.apply(this, v);
    let w = W / n;

    ctx.rotate(Math.PI);
    ctx.translate(-W, -H);
    ctx.scale(-1, 0.3 * H / Math.max.apply(this, v));

    ctx.fillStyle = "rgba(120,0,0,0.9)";
    for (let i = 0; i < n; i++) {
        ctx.fillRect(x - i * w, 0, w, v[i]);
    }
    ctx.restore();
}
