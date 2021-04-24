// -*- mode: javascript; js-indent-level: 2 -*-

import * as fs from 'fs'
import * as core from '@actions/core'
import * as exec from '@actions/exec'

async function haveExecutable(path: string): Promise<boolean> {
  try {
    await fs.promises.access(path, fs.constants.X_OK)
  } catch (err) {
    return false
  }
  return true
}

export async function ensureSnapd(): Promise<void> {
  const haveSnapd = await haveExecutable('/usr/bin/snap')
  if (!haveSnapd) {
    core.info('Installing snapd...')
    await exec.exec('sudo', ['apt-get', 'update', '-q'])
    await exec.exec('sudo', ['apt-get', 'install', '-qy', 'snapd'])
  }
  // The Github worker environment has weird permissions on the root,
  // which trip up snap-confine.
  const root = await fs.promises.stat('/')
  if (root.uid !== 0 || root.gid !== 0) {
    await exec.exec('sudo', ['chown', 'root:root', '/'])
  }
}

export async function ensureReviewTools(): Promise<void> {
  const haveReviewTools = await haveExecutable('/snap/bin/review-tools')
  core.info('Installing review-tools ...')
  await exec.exec('sudo', [
    'snap',
    haveReviewTools ? 'refresh' : 'install',
    'review-tools'
  ])
}
