import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          KEEPING
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          선결제 디지털 플랫폼
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/owner/login"
            className="block w-64 mx-auto bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors"
          >
            사장님 로그인
          </Link>
          
          <Link 
            href="/customer/login"
            className="block w-64 mx-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            고객 로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
