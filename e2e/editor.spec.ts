import { readFile } from 'node:fs/promises'
import { PNG } from 'pngjs'
import { expect, test } from '@playwright/test'

test('edita una escena y renderiza en escritorio y móvil', async ({ page }, testInfo) => {
  const viewport = testInfo.project.use.viewport
  if (viewport) await page.setViewportSize(viewport)

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Escena' })).toBeVisible()

  const canvas = page.getByLabel('Viewport 3D interactivo')
  await expect(canvas).toBeVisible()
  await expect
    .poll(() => canvas.evaluate((element) => (element as HTMLCanvasElement).width))
    .toBeGreaterThan(0)

  const viewportImage = PNG.sync.read(await canvas.screenshot())
  const colors = new Set<string>()
  for (let y = 0; y < viewportImage.height; y += 4) {
    for (let x = 0; x < viewportImage.width; x += 4) {
      const offset = (viewportImage.width * y + x) * 4
      colors.add(
        `${viewportImage.data[offset]},${viewportImage.data[offset + 1]},${viewportImage.data[offset + 2]}`,
      )
    }
  }
  expect(colors.size).toBeGreaterThan(20)
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}.png`), fullPage: true })

  await page.getByRole('button', { name: 'Esfera', exact: true }).click()
  const sphere = page.getByRole('option', { name: /Esfera 2/ })
  await sphere.click()
  const positionX = page.getByRole('spinbutton', { name: 'Posición, eje X' })
  await positionX.fill('2.5')
  await expect(positionX).toHaveValue('2.5')
  await page.getByRole('heading', { name: 'Escena' }).click()
  await page.keyboard.press('Control+z')
  await expect(positionX).toHaveValue('0')
  await page.keyboard.press('Control+Shift+z')
  await expect(positionX).toHaveValue('2.5')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Guardar' }).click()
  const download = await downloadPromise
  const scenePath = testInfo.outputPath(`${testInfo.project.name}-scene.json`)
  await download.saveAs(scenePath)
  const scene = JSON.parse(await readFile(scenePath, 'utf8')) as {
    format: string
    version: number
    watermark: { product: string; notice: string }
    objects: Array<{ name: string; position: number[] }>
  }
  expect(scene.format).toBe('malla-scene')
  expect(scene.version).toBe(1)
  expect(scene.watermark).toEqual({ product: 'Malla 3D', notice: 'NO COMERCIAL' })
  expect(scene.objects).toHaveLength(2)
  expect(scene.objects.find((object) => object.name === 'Esfera 2')?.position[0]).toBe(2.5)

  await page.getByRole('option', { name: /Cubo/ }).click()
  await page.getByRole('button', { name: 'Modo Vértice (Tab)' }).click()
  await page.getByRole('button', { name: /V01/ }).click()
  await page.getByRole('spinbutton', { name: 'Posición local, eje X' }).fill('-0.75')
  await page.getByRole('button', { name: 'Modo Cara' }).click()
  await page.getByRole('button', { name: /F01/ }).click()
  await page.getByRole('button', { name: /Extruir cara/ }).click()
  await expect(page.getByText('10 CARAS')).toBeVisible()
  await page.getByRole('button', { name: /Inset/ }).click()
  await expect(page.getByText('14 CARAS')).toBeVisible()

  const editedDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Guardar' }).click()
  const editedDownload = await editedDownloadPromise
  const editedScenePath = testInfo.outputPath(`${testInfo.project.name}-edited-scene.json`)
  await editedDownload.saveAs(editedScenePath)
  const editedScene = JSON.parse(await readFile(editedScenePath, 'utf8')) as {
    objects: Array<{ name: string; vertices?: number[][]; faces?: number[][] }>
  }
  const editedCube = editedScene.objects.find((object) => object.name === 'Cubo')
  expect(editedCube?.vertices).toHaveLength(16)
  expect(editedCube?.faces).toHaveLength(14)

  if (testInfo.project.name === 'mobile') {
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(horizontalOverflow).toBe(false)
  }
})