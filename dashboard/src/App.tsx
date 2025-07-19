import { useState } from 'react';
import Home from './components/Home'

function App() {

  const [language, setLanguage] = useState('en');

  return (
   <div className='bg-dark'>
     <div className="text-light m-0 p-0">
        <div className="container-fluid p-3 nav-color d-flex justify-content-center align-items-center">
            <div className="bg-secondary p-2 rounded">
                <h2 className="fw-bold">
                  <i className="bi bi-controller"></i> {language==='en'?"VIDEO GAME SALES OVERVIEW 1980-2016": "APERÇU DES VENTES DE JEUX VIDÉO 1980-2016"}
                </h2>
            </div>
            <div className="ms-3">
              <button
                className={`btn btn-sm me-2 ${language === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setLanguage('en')}
              >
                ENGLISH
              </button>
              <button
                className={`btn btn-sm ${language === 'fr' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setLanguage('fr')}
              >
                FRANCAIS
              </button>
            </div>
        </div>
      </div>
     <Home language={language} />
   </div>
  )
}

export default App
