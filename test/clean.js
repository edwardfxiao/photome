import { expect } from 'chai';
import { handleDeletingAndConverting } from '../src/main/index.js';
describe('clean', () => {
  // test for clean function
  it('complete', async () => {
    const files = ['IMG_0001.CR3', 'IMG_0001.JPG', 'IMG_0002.CR3', 'IMG_0002.JPG', 'IMG_0003.CR3', 'IMG_0003.JPG'];
    const result = await handleDeletingAndConverting(files);
    // to equal shallow comparison
    expect(result.jpgHash).to.eql({ IMG_0001: 'IMG_0001.JPG', IMG_0002: 'IMG_0002.JPG', IMG_0003: 'IMG_0003.JPG' });
  });
  it('removed 2 cr3 files, jpgHash should removed as well', async () => {
    const files = ['IMG_0001.JPG', 'IMG_0002.CR3', 'IMG_0002.JPG', 'IMG_0003.JPG'];
    const result = await handleDeletingAndConverting(files);
    // to equal shallow comparison
    expect(result.jpgHash).to.eql({ IMG_0002: 'IMG_0002.JPG' });
  });
  it('removed 2 cr3 files, heicHash should be add', async () => {
    const files = ['IMG_0001.JPG', 'IMG_0002.CR3', 'IMG_0002.JPG', 'IMG_0003.JPG'];
    const result = await handleDeletingAndConverting(files);
    // to equal shallow comparison
    expect(result.heicHash).to.eql({ IMG_0002: 'IMG_0002.heic' });
  });
  it("don't do anything if there is no cr3 file", async () => {
    const files = ['IMG_0001.JPG', 'IMG_0002.JPG', 'IMG_0003.JPG'];
    const result = await handleDeletingAndConverting(files);
    // to equal shallow comparison
    expect(result.jpgHash).to.eql({ IMG_0001: 'IMG_0001.JPG', IMG_0002: 'IMG_0002.JPG', IMG_0003: 'IMG_0003.JPG' });
  });
});
