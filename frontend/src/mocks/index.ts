// MSW 초기화
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  import('./browser').then(() => {
    console.log('MSW started successfully')
  }).catch((error) => {
    console.error('Failed to import MSW browser:', error)
  })
}

export {}
