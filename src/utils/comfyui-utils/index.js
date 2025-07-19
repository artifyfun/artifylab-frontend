/* eslint-disable */

import { getPngMetadata, getWebpMetadata, getLatentMetadata } from './pnginfo.js'

/**
 * Loads workflow data from the specified file
 * @param {File} file
 */
export function handleFile(file) {
  return new Promise(async (resolve, reject) => {
    if (file.type === 'image/png') {
      const pngInfo = await getPngMetadata(file)
      if (pngInfo) {
        if (pngInfo.workflow) {
          resolve(JSON.parse(pngInfo.workflow))
        } else {
          reject()
        }
      } else {
        reject()
      }
    } else if (file.type === 'image/webp') {
      const pngInfo = await getWebpMetadata(file)
      if (pngInfo) {
        if (pngInfo.workflow) {
          resolve(JSON.parse(pngInfo.workflow))
        } else if (pngInfo.Workflow) {
          resolve(JSON.parse(pngInfo.Workflow)) // Support loading workflows from that webp custom node.
        } else {
          reject()
        }
      }
    } else if (file.type === 'application/json' || file.name?.endsWith('.json')) {
      const reader = new FileReader()
      reader.onload = async () => {
        const jsonContent = JSON.parse(reader.result)
        if (!jsonContent?.templates) {
          resolve(jsonContent)
        } else {
          reject()
        }
      }
      reader.readAsText(file)
    } else if (file.name?.endsWith('.latent') || file.name?.endsWith('.safetensors')) {
      const info = await getLatentMetadata(file)
      if (info.workflow) {
        resolve(JSON.parse(info.workflow))
      } else {
        reject()
      }
    } else {
      reject()
    }
  })
}
