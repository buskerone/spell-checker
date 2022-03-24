import type { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'

const url = "https://us-east1-serverless-306422.cloudfunctions.net/spellchecker"

const Home: NextPage = () => {
  const [initialPhrase, setInitialPhrase] = useState<string>('')
  const [corrected, setCorrected] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)

  const fixIt = () => {
    if (initialPhrase) {
      setError(null)
      setCorrected('')
      getMisspelledWords()
    } else {
      setError('Try to write something!')
    }
  }

  const getMisspelledWords = () => {
    const wordsArray = initialPhrase.trim().split(" ");
    const urls = wordsArray.map(w => `${url}/misspelled?word=${w}`)

    setIsLoading(true)

    Promise.all(urls.map(url =>
      fetch(url)
        .then(response => response.json())
        .catch(e => {
          setError(e)
          setIsLoading(false)
        })
    )).then(data => {
      const misspelledWords = data.filter(d => d.misspelled)
      getCorrections(misspelledWords)
    })
  }

  const getCorrections = (misspelledWords: any) => {
    Promise.all(misspelledWords.map((w: any) =>
      fetch(`${url}/corrections?word=${w.word}`)
        .then(response => response.json())
        .catch(e => {
          setError(e)
          setIsLoading(false)
        })
    )).then(data => {
      data.forEach((c, key) => {
        setCorrected((prevCorrected) => {
          const phrase = prevCorrected === '' ? initialPhrase : prevCorrected
          const newCorrectedPhrase = phrase.replace(misspelledWords[key].word, c.corrections[0])

          return newCorrectedPhrase
        })
      })

      setIsLoading(false)
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Spell checker App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Spell checker App
        </h1>

        <div className="mt-6 flex flex-col sm:max-w-4xl w-full flex-wrap items-center justify-around">
          <textarea
            placeholder="write something here"
            className="sm:w-3/4 w-full h-52 bg-gray-100 px-8 py-6 rounded"
            onChange={(e) => setInitialPhrase(e.target.value)}
          />
          {!error && 
            <div className="flex justify-center items-center mt-4">
              {isLoading &&
                <div>
                  <svg role="status" className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                </div>
              }
              {corrected && <div className="px-3 py-3 rounded border border-blue-400">{`Result: ${corrected}`}</div>}
            </div>
          }
          {error && <div className="mt-4 text-red-400">{`Error: ${error}`}</div>}
          <button
            className="border rounded px-3 py-2 my-4 active:border-blue-200"
            onClick={fixIt}
          >
            Fix it now!
          </button>
        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center gap-2 text-sm"
          href="https://carlosknopel.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made by <b>Carlos Knopel</b>
        </a>
      </footer>
    </div>
  )
}

export default Home
