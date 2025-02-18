/**
 * Compresses a string using the native CompressionStream API
 */
export async function compress(str: string): Promise<string> {
  try {
    // Use TextEncoder to convert the string to Uint8Array
    const byteArray = new TextEncoder().encode(str);
    
    // Create a compression stream
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    
    // Write the data
    await writer.write(byteArray);
    await writer.close();
    
    // Read the compressed data
    const output = [];
    const reader = cs.readable.getReader();
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      output.push(value);
    }
    
    // Concatenate the chunks and convert to base64
    const concatenated = new Uint8Array(output.reduce((acc, val) => acc + val.length, 0));
    let offset = 0;
    output.forEach(arr => {
      concatenated.set(arr, offset);
      offset += arr.length;
    });
    
    return btoa(String.fromCharCode.apply(null, Array.from(concatenated)));
  } catch (error) {
    console.error('Compression failed, falling back to original data:', error);
    return str;
  }
}

/**
 * Decompresses a string that was compressed with compress()
 */
export async function decompress(compressedStr: string): Promise<string> {
  try {
    // Convert base64 to Uint8Array
    const byteArray = new Uint8Array(
      atob(compressedStr)
        .split('')
        .map(char => char.charCodeAt(0))
    );
    
    // Create a decompression stream
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    
    // Write the compressed data
    await writer.write(byteArray);
    await writer.close();
    
    // Read the decompressed data
    const output = [];
    const reader = ds.readable.getReader();
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      output.push(value);
    }
    
    // Concatenate the chunks and convert back to string
    const concatenated = new Uint8Array(output.reduce((acc, val) => acc + val.length, 0));
    let offset = 0;
    output.forEach(arr => {
      concatenated.set(arr, offset);
      offset += arr.length;
    });
    
    return new TextDecoder().decode(concatenated);
  } catch (error) {
    console.error('Decompression failed, returning original data:', error);
    return compressedStr;
  }
}