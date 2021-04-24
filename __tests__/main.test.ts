// -*- mode: javascript; js-indent-level: 2 -*-

import {ReviewTools, Notices} from '../src/review-tools'
import * as tools from '../src/tools'

const MOCK_JSON = {
  'test-snap': {
    'test-channel': {
      'libglib2.0-0': ['4049-1', '4759-1', '4764-1'],
      snapcraft: ['4661-1']
    }
  }
}

test('ReviewTools.checkNotices identifies notices', async () => {
  const expectedOutput: Notices = {
    outdated: true,
    outdatedPackages: ['libglib2.0-0', 'snapcraft'],
    usnsByPackage: {
      'libglib2.0-0': ['4049-1', '4759-1', '4764-1'],
      snapcraft: ['4661-1']
    }
  }

  const ensureSnapd = jest
    .spyOn(tools, 'ensureSnapd')
    .mockImplementation(async (): Promise<void> => {})
  const ensureReviewTools = jest
    .spyOn(tools, 'ensureReviewTools')
    .mockImplementation(async (): Promise<void> => {})

  const reviewTools = new ReviewTools('test-snap', 'test-channel')
  const getSnapFilePathOrDownload = jest
    .spyOn(reviewTools, 'getSnapFilePathOrDownload')
    .mockImplementation(async (): Promise<string> => 'test-snap.snap')
  const getNoticesJson = jest
    .spyOn(reviewTools, 'getNoticesJson')
    .mockImplementation(
      async (_snapFilePath: string): Promise<any> => MOCK_JSON
    )

  const notices = await reviewTools.checkNotices()

  expect(notices).toEqual(expectedOutput)

  expect(ensureSnapd).toHaveBeenCalledTimes(1)
  expect(ensureReviewTools).toHaveBeenCalledTimes(1)
  expect(getSnapFilePathOrDownload).toHaveBeenCalledTimes(1)
  expect(getNoticesJson).toHaveBeenCalledWith('test-snap.snap')
})
