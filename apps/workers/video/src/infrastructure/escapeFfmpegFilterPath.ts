/**
 * FFmpeg filtergraph paths need `:` escaped and backslashes normalized (matters on Windows,
 * e.g. drive letters). The `subtitles` filter parses its argument twice — once as a generic
 * filtergraph option, once internally to split filename/original_size/force_style — so a `:`
 * needs a *double* backslash to survive both passes as a literal colon.
 */
export function escapeFfmpegFilterPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/:/g, "\\\\:")
}
