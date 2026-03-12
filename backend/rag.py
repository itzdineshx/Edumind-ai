from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

# Load embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def process_pdf(pdf_path):

    loader = PyPDFLoader(pdf_path)
    pages = loader.load()

    db = FAISS.from_documents(pages, embeddings)

    return db


def search_pdf(db, query):

    docs = db.similarity_search(query)

    return docs[0].page_content