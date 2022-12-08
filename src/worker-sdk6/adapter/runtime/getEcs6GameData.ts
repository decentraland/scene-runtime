
export async function getGameData(): Promise<string | undefined> {
  try {
    // const [parcelData, realm] = await Promise.all([getParcel({}), getCurrentRealm({})])
    // const contents: any[] = (parcelData.land as any).mappingsResponse?.contents
    // const file = contents.find((item) => item.file === 'ecs6/game.data')!
    // const url = realm.currentRealm?.domain + '/content/contents/' + file.hash
    // const ecs6js = await fetch(url)
    // const data = await ecs6js.text()
    // return data
    return
  } catch (err: any) {
    dcl.error(err)
  }
}
