let currentPDF = null;
let currentPage = 1;
let zoomLevel = 1;

function openPDF() {
    const fileInput = document.getElementById('pdf-upload');
    const file = fileInput.files[0];

    if (file && file.type === 'application/pdf') {
        const fileReader = new FileReader();

        fileReader.onload = function (e) {
            const pdfData = new Uint8Array(e.target.result);
            loadAndRenderPDF(pdfData);
        };

        fileReader.readAsArrayBuffer(file);
    } else {
        alert("Please select a valid PDF file.");
    }
}

function loadAndRenderPDF(pdfData) {
    pdfjsLib.getDocument(pdfData).promise.then((pdfDoc) => {
        currentPDF = pdfDoc;
        renderAllPages();
    }).catch((error) => {
        console.error('Error loading PDF: ' + error);
    });
}

function renderAllPages() {
    const pdfWrapper = document.getElementById('pdf-wrapper');
    for (let i = 1; i <= currentPDF.numPages; i++) {
        const canvas = document.createElement('canvas');
        canvas.classList.add('pdf-page');
        pdfWrapper.appendChild(canvas);
        renderPage(i, canvas);
    }
}

function renderPage(pageNum, canvas) {
    currentPDF.getPage(pageNum).then((page) => {
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: zoomLevel });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        page.render({
            canvasContext: context,
            viewport: viewport
        });
    });
}

// Adjust zoom level
function zoomPDF(zoomValue) {
    zoomLevel = parseFloat(zoomValue);
    renderAllPages();
}

// Scroll to navigate through pages
const pdfContainer = document.getElementById('pdf-container');
pdfContainer.addEventListener('wheel', (e) => {
    if (e.deltaY > 0) {
        // Scroll Down, Next Page
        if (currentPage < currentPDF.numPages) {
            currentPage++;
            renderPage(currentPage, document.querySelectorAll('.pdf-page')[currentPage - 1]);
        }
    } else {
        // Scroll Up, Previous Page
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage, document.querySelectorAll('.pdf-page')[currentPage - 1]);
        }
    }
});
