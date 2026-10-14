import { useEffect, useState } from 'react'
import { assetUrl, profile } from './data/profile'
import PortraitScene from './scene/PortraitScene'

const navigation = [
  ['about', 'About'],
  ['experience', '经历'],
  ['projects', '项目'],
  ['contact', '联系'],
] as const

export default function App() {
  const [active, setActive] = useState('about')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-20% 0px -55% 0px' },
    )
    navigation.forEach(([id]) => {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div className={`site${scrolled ? ' is-scrolled' : ''}`}>
      <a className="skip-link" href="#about">跳转至正文</a>
      <PortraitScene portraitUrl={assetUrl(profile.portraitUrl)} />
      <div className="grain" aria-hidden="true" />
      <div className="frame" aria-hidden="true"><span>+</span><span>+</span><span>+</span><span>+</span></div>

      <header className="site-header">
        <a className="wordmark" href="#about" aria-label="张鑫振，首页">ZXZ<span> / JOSEPH</span></a>
        <nav aria-label="主导航">
          {navigation.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>{label}</a>
          ))}
        </nav>
      </header>

      <main id="main-content">
        <section className="hero" id="about" aria-labelledby="hero-title">
          <div className="hero-copy copy-column">
            <p className="eyebrow"><span className="status-dot" /> PERSONAL PROFILE / 2026</p>
            <h1 id="hero-title">{profile.name}<span className="hero-name-alias">（{profile.alias}）</span></h1>
            <p className="tagline">{profile.tagline}</p>
            <p className="bio">{profile.bio}</p>
            <a className="text-link hero-link" href="#experience">了解我的经历 <span aria-hidden="true">↘</span></a>
          </div>
          <div className="hero-caption" aria-hidden="true"><span>01 / ABOUT</span><span>AI TESTING · ENGINEERING</span></div>
          <a className="scroll-cue" href="#experience"><span>SCROLL TO EXPLORE</span><i aria-hidden="true" /></a>
        </section>

        <section className="experience" id="experience" aria-labelledby="experience-title">
          <div className="section-heading copy-column">
            <p className="eyebrow">02 / THE JOURNEY</p>
            <h2 id="experience-title"><span>Experience</span></h2>
          </div>
          <ol className="timeline copy-column">
            {profile.timeline.map((entry, index) => (
              <li className="timeline-entry" key={entry.organization}>
                <span className="timeline-node" aria-hidden="true">0{index + 1}</span>
                <div className="entry-content">
                  <p className="entry-type eyebrow">{entry.type}</p>
                  <p className="entry-period">{entry.period}</p>
                  <h3>{entry.organization}</h3>
                  <p className="entry-role">{entry.role}</p>
                  {entry.description.length > 0 && (
                    <div className="entry-description">
                      {entry.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="projects" id="projects" aria-labelledby="projects-title">
          <div className="copy-column">
            <p className="eyebrow">03 / SELECTED WORK</p>
            <h2 id="projects-title"><span>Projects</span></h2>
            <div className="project-placeholder"><span aria-hidden="true">↗</span><p>待更新</p></div>
          </div>
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-title">
          <div className="copy-column">
            <p className="eyebrow">04 / GET IN TOUCH</p>
            <h2 id="contact-title"><span>Let’s talk.</span></h2>
            <div className="contact-links">
              <a href={`mailto:${profile.email}`}><span className="eyebrow">EMAIL</span><span>{profile.email}</span><i aria-hidden="true">↗</i></a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer"><span className="eyebrow">GITHUB</span><span>Zxz-Joseph<span className="sr-only">（在新标签页打开）</span></span><i aria-hidden="true">↗</i></a>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>© 2026 {profile.name}</span>
        <span className="portrait-credit">
          <a href="https://www.meshy.ai/" target="_blank" rel="noopener noreferrer" aria-label="人像由 Meshy 生成（在新标签页打开）">PORTRAIT · MESHY</a>
          {' / '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" title="人像已抠除背景、裁切并调整尺寸" aria-label="人像 CC BY 4.0 许可，已抠除背景、裁切并调整尺寸（在新标签页打开）">CC BY 4.0</a>
        </span>
        <a href="#about">BACK TO TOP ↑</a>
      </footer>
    </div>
  )
}
