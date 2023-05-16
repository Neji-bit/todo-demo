//  テキスト40p。

//  SW内でのキャッシュ名を定義。
//  本格的にキャッシュ管理をする（＝常に最新を利用する）には、このキャッシュ名にバージョンを入れて更新管理する。
let cacheName = 'logbo'

//  キャッシュ（＝オフラインでも利用可能）するリソースを定義。
let filesToCache = [
  '/',
]

////////////////////////////////////////////////////////////////////////////////
//  インストール処理。
//  AppShell（アプリの基本リソース）をキャッシュする。
self.addEventListener('install', (e) => {
  console.log('ServiceWorker installing...')
  e.waitUntil(
    caches.open(cacheName).then((c) => {
      console.log('Service Worker caching app shell')
      return c.addAll(filesToCache)
    })
  )
})

////////////////////////////////////////////////////////////////////////////////
//  SW起動処理。
//  キャッシュの洗い替え。
self.addEventListener('activate', (e) => {
  console.log("Service Worker activating...")
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((k) => {
        if(k !== cacheName) {
          console.log("Service Worker removing old cache")
          return caches.delete(k)
        }
      }))
    })
  )
  //  自身（このサービスワーカー）ですぐにスコープ配下のリソースを管理する。
  return self.clients.claim()
})

////////////////////////////////////////////////////////////////////////////////
//  リソース要求への対応。
//  キャッシュがあればそれを返し、なければ外部からリソースを取得する。
self.addEventListener('fetch', (e) => {
  console.log("Service Worker fetching ", e.request.url)
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request)
    })
  )
})

