import { storage } from './app'
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage'
import { v4 as uuidV4 } from 'uuid'

export const USER_ASSET_SUB_FOLDER = 'users'
export const LOOTBOX_ASSET_FOLDER = `assets`
export const LOOTBOX_ASSET_SUB_FOLDER = 'lootbox'

/**
 * Save image to gbucket
 * @param fileDestination filepath within the gbucket
 * @param file
 */
const uploadImageToBucket = async (fileDestination: string, file: File) => {
  // Create a reference to 'mountains.jpg'
  const storageRef = ref(storage, fileDestination)

  // 'file' comes from the Blob or File API
  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

export const uploadLootboxLogo = async (folder: string, file: File): Promise<string> => {
  const extension = file?.name?.split('.').pop()
  const fileDestination = `${LOOTBOX_ASSET_FOLDER}/${LOOTBOX_ASSET_SUB_FOLDER}/${folder}/logo${
    extension ? '.' + extension : ''
  }`
  const res = await uploadImageToBucket(fileDestination, file)
  return res
}

export const uploadLootboxCover = async (folder: string, file: File): Promise<string> => {
  const extension = file?.name?.split('.').pop()
  const fileDestination = `${LOOTBOX_ASSET_FOLDER}/${LOOTBOX_ASSET_SUB_FOLDER}/${folder}/cover${
    extension ? '.' + extension : ''
  }`
  const res = await uploadImageToBucket(fileDestination, file)
  return res
}

export const uploadLootboxBadge = async (folder: string, file: File): Promise<string> => {
  const extension = file?.name?.split('.').pop()
  const fileDestination = `${LOOTBOX_ASSET_FOLDER}/${LOOTBOX_ASSET_SUB_FOLDER}/${folder}/badge${
    extension ? '.' + extension : ''
  }`
  const res = await uploadImageToBucket(fileDestination, file)
  return res
}

export const uploadTournamentCover = async (file: File): Promise<string> => {
  const extension = file?.name?.split('.').pop()
  const folder = uuidV4()
  const fileDestination = `${LOOTBOX_ASSET_FOLDER}/tournament/${folder}/cover${extension ? '.' + extension : ''}`
  const res = await uploadImageToBucket(fileDestination, file)
  return res
}

export const uploadUserAvatar = async (folder: string, file: File): Promise<string> => {
  const extension = file?.name?.split('.').pop()
  const fileDestination = `${LOOTBOX_ASSET_FOLDER}/${USER_ASSET_SUB_FOLDER}/${folder}/avatar-${uuidV4()}${
    extension ? '.' + extension : ''
  }`
  const res = await uploadImageToBucket(fileDestination, file)
  return res
}

export const uploadUserHeadshot = async (folder: string, file: File): Promise<string> => {
  const extension = file?.name?.split('.').pop()
  const fileDestination = `${LOOTBOX_ASSET_FOLDER}/${USER_ASSET_SUB_FOLDER}/${folder}/headshot-${uuidV4()}${
    extension ? '.' + extension : ''
  }`
  const res = await uploadImageToBucket(fileDestination, file)
  return res
}
