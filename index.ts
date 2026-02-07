import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();
const PORT = 3000;

let books = [
    { id: 1, title: "Laskar Pelangi", author: "Andrea Hirata", year: 2005 },
    { id: 2, title: "Hujan", author: "Tere Liye", year: 2016 },
];

app.use(express.json());

const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 

app.get('/books', (req, res) => {
    res.status(200).json(books);
});

app.get('/books/search', (req, res) => {
    const title = req.query.title as string;
    
    if (!title) {
        return res.status(400).json({ message: ' "title" diperlukan' });
    }
    
    const filteredBooks = books.filter(b => 
        b.title.toLowerCase().includes(title.toLowerCase())
    );
    
    res.status(200).json(filteredBooks);
});

app.get('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(b => b.id === id);
    
    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: 'Buku tidak ditemukan' });
    }
});

app.post('/books', (req, res) => {
    const { title, author, year } = req.body;
    
    if (!title || !year) {
        return res.status(400).json({ message: "Title dan year harus diisi" });
    }
    
    const newBook = { 
        id: Date.now(), 
        title, 
        author: author || 'Unknown', 
        year: parseInt(year) 
    };
    
    books.push(newBook);
    res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, author, year } = req.body;
    const index = books.findIndex(b => b.id === id);

    if (index !== -1) {
        books[index] = { 
            ...books[index], 
            title: title || books[index].title, 
            author: author || books[index].author,
            year: year || books[index].year
        };
        res.status(200).json(books[index]);
    } else {
        res.status(404).json({ message: 'Buku tidak ditemukan' });
    }
});

app.delete('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = books.length;
    const newBooks = books.filter(b => b.id !== id);

    if (newBooks.length < initialLength) {
        books = newBooks;
        res.status(200).json({ message: 'Buku berhasil dihapus' });
    } else {
        res.status(404).json({ message: 'Buku tidak ditemukan' });
    }
});

app.get('/', (req, res) => {
    res.send('<h1>Server API ready</h1>');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
