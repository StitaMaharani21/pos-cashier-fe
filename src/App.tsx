import './App.css'

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-orange-500">
          Tailwind CSS Berhasil! 🎉
        </h1>
        <p className="mt-2 text-slate-600">
          Kalau kamu lihat background abu-abu, card putih dengan shadow, dan
          judul warna oranye — berarti Tailwind sudah terpasang dengan benar.
        </p>
        <button className="mt-4 rounded-md bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600">
          Test Button
        </button>
      </div>
    </div>
  )
}

export default App
