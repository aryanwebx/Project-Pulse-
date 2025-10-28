import { Link } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useRef } from 'react'

const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 1
        this.speedX = (Math.random() - 0.5) * 1.2
        this.speedY = (Math.random() - 0.5) * 1.2
        const colors = [
          { r: 59, g: 130, b: 246 },
          { r: 147, g: 51, b: 234 },
          { r: 236, g: 72, b: 153 },
          { r: 168, g: 85, b: 247 },
          { r: 99, g: 102, b: 241 },
        ]
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // bounce at edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }

      draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 5)
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 1)`)
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const particles = []
    const numParticles = Math.min((canvas.width * canvas.height) / 9000, 120)
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.update()
        p.draw()

        // connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < 120) {
            const opacity = 0.2 * (1 - distance / 120)
            ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${opacity})`
            ctx.lineWidth = 0.4
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Canvas Background Animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-[30%] left-[15%] w-[450px] h-[450px] bg-violet-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                <div className="relative h-12 w-12 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <span className="text-white font-bold text-xl">PP</span>
                </div>
              </div>
              <span className="ml-4 text-2xl font-bold text-white">
                Project Pulse
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-300 font-medium">Welcome, <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 font-semibold">{user?.name}</span></span>
                  <Link 
                    to="/app/dashboard" 
                    className="relative group px-8 py-3 rounded-2xl font-semibold text-white overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                    <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-75 blur-xl transition-opacity"></div>
                    <span className="relative flex items-center gap-2">
                      Go to App 
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-300 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-white/10"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="relative group px-8 py-3 rounded-2xl font-semibold text-white overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                    <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-75 blur-xl transition-opacity"></div>
                    <span className="relative">Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          {/* Floating Badge */}
          <div className="inline-flex items-center space-x-3 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-12 shadow-2xl hover:scale-105 transition-transform duration-300">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-linear-to-r from-purple-400 to-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-linear-to-r from-purple-400 to-pink-400"></span>
            </span>
            <span className="text-sm font-semibold bg-linear-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">AI-Powered Platform • Trusted by Communities</span>
          </div>

          <h1 className="text-7xl md:text-8xl font-black text-white mb-8 leading-none tracking-tight">
            <span className="inline-block hover:scale-105 transition-transform duration-300">AI-Powered Issue</span>
            <br />
            <span className="relative inline-block mt-2">
              <span className="absolute inset-0 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 blur-3xl opacity-60 animate-pulse"></span>
              <span className="relative bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent inline-block hover:scale-105 transition-transform duration-300">
                Tracking Platform
              </span>
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Revolutionize community management with intelligent issue tracking. 
            Harness the power of AI for smart suggestions, instant duplicate detection, 
            and seamless workflow automation.
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link 
                to="/register" 
                className="relative group px-12 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 blur-2xl animate-pulse"></div>
                </div>
                <span className="relative flex items-center gap-3">
                  Start Free Today
                  <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link 
                to="/login" 
                className="group px-12 py-5 rounded-2xl font-bold text-lg bg-white/10 hover:bg-white/20 backdrop-blur-xl border-2 border-white/20 hover:border-purple-400/50 text-white shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 relative">
          <div className="relative group perspective-1000">
            <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-cyan-500 to-blue-400 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 animate-pulse"></div>
            <div className="relative bg-linear-to-br from-blue-500/10 via-cyan-500/10 to-blue-400/10 backdrop-blur-2xl rounded-3xl p-10 border border-blue-500/30 hover:border-cyan-400/50 shadow-2xl transform hover:scale-105 hover:-translate-y-3 hover:rotate-1 transition-all duration-500">
              <div className="text-6xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 filter drop-shadow-2xl">🐛</div>
              <h3 className="text-3xl font-bold mb-5 bg-linear-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Smart Issue Tracking
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Report and monitor community issues with AI-powered categorization and priority assessment.
              </p>
              <div className="mt-8 flex items-center text-cyan-400 font-semibold group-hover:gap-3 gap-2 transition-all duration-300">
                <span>Learn More</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="relative group perspective-1000">
            <div className="absolute inset-0 bg-linear-to-r from-purple-600 via-fuchsia-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 animate-pulse"></div>
            <div className="relative bg-linear-to-br from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 backdrop-blur-2xl rounded-3xl p-10 border border-purple-500/30 hover:border-fuchsia-400/50 shadow-2xl transform hover:scale-105 hover:-translate-y-3 hover:rotate-1 transition-all duration-500">
              <div className="text-6xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 filter drop-shadow-2xl">🤖</div>
              <h3 className="text-3xl font-bold mb-5 bg-linear-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                AI Insights
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Get intelligent suggestions, duplicate detection, and automated categorization.
              </p>
              <div className="mt-8 flex items-center text-fuchsia-400 font-semibold group-hover:gap-3 gap-2 transition-all duration-300">
                <span>Learn More</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="relative group perspective-1000">
            <div className="absolute inset-0 bg-linear-to-r from-pink-600 via-rose-500 to-orange-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 animate-pulse"></div>
            <div className="relative bg-linear-to-br from-pink-500/10 via-rose-500/10 to-orange-500/10 backdrop-blur-2xl rounded-3xl p-10 border border-pink-500/30 hover:border-rose-400/50 shadow-2xl transform hover:scale-105 hover:-translate-y-3 hover:rotate-1 transition-all duration-500">
              <div className="text-6xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 filter drop-shadow-2xl">🏘️</div>
              <h3 className="text-3xl font-bold mb-5 bg-linear-to-r from-pink-300 to-orange-300 bg-clip-text text-transparent">
                Multi-Community
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Manage multiple communities with separate issue tracking and admin controls.
              </p>
              <div className="mt-8 flex items-center text-rose-400 font-semibold group-hover:gap-3 gap-2 transition-all duration-300">
                <span>Learn More</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-32 relative group">
          <div className="absolute inset-0 bg-linear-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-linear-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-16 hover:border-white/30 transition-all duration-500">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 hover:scale-105 inline-block transition-transform duration-300">Trusted by Communities Worldwide</h2>
              <p className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-purple-300 to-pink-300 text-xl">Real results from real communities</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center group/stat cursor-pointer">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-cyan-400 to-blue-300 blur-3xl opacity-50 group-hover/stat:opacity-100 transition-opacity animate-pulse"></div>
                  <div className="relative text-7xl md:text-8xl font-black bg-linear-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent transform group-hover/stat:scale-125 transition-all duration-500">
                    99%
                  </div>
                </div>
                <div className="text-white text-xl font-bold mb-2">Issues Resolved</div>
                <p className="text-gray-400">Successfully closed and tracked</p>
              </div>
              <div className="text-center group/stat cursor-pointer">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-linear-to-r from-purple-400 via-fuchsia-400 to-pink-400 blur-3xl opacity-50 group-hover/stat:opacity-100 transition-opacity animate-pulse"></div>
                  <div className="relative text-7xl md:text-8xl font-black bg-linear-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent transform group-hover/stat:scale-125 transition-all duration-500">
                    50%
                  </div>
                </div>
                <div className="text-white text-xl font-bold mb-2">Faster Resolution</div>
                <p className="text-gray-400">Average time saved per issue</p>
              </div>
              <div className="text-center group/stat cursor-pointer">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-linear-to-r from-pink-400 via-rose-400 to-orange-400 blur-3xl opacity-50 group-hover/stat:opacity-100 transition-opacity animate-pulse"></div>
                  <div className="relative text-7xl md:text-8xl font-black bg-linear-to-r from-pink-400 via-rose-300 to-orange-400 bg-clip-text text-transparent transform group-hover/stat:scale-125 transition-all duration-500">
                    24/7
                  </div>
                </div>
                <div className="text-white text-xl font-bold mb-2">AI Monitoring</div>
                <p className="text-gray-400">Continuous intelligent tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-2xl mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                <div className="relative h-14 w-14 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <span className="text-white font-bold text-2xl">PP</span>
                </div>
              </div>
            </div>
            <p className="text-white font-semibold text-lg mb-2">
              &copy; 2024 Project Pulse. All rights reserved.
            </p>
            <p className="text-transparent bg-clip-text bg-linear-to-r from-gray-400 via-purple-400 to-gray-400">
              Building better communities with AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home