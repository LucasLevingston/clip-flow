import type {
  AiCompletionProvider,
  GenerateCopyInput,
  GenerateCopyResult,
  SelectHighlightInput,
} from "../domain/services/AiCompletionProvider"
import { HighlightSelection } from "../domain/value-objects/HighlightSelection"
import { VideoCopy } from "../domain/value-objects/VideoCopy"

export class FakeAiCompletionProvider implements AiCompletionProvider {
  highlightToReturn = HighlightSelection.create(0, 20_000, ["seg-1"])
  copyResultToReturn: GenerateCopyResult = {
    copy: VideoCopy.create("Title", "Description", ["#tag"], "Segue pra não perder"),
    contentFlags: [],
  }
  selectHighlightInputs: SelectHighlightInput[] = []
  generateCopyInputs: GenerateCopyInput[] = []

  selectHighlight(input: SelectHighlightInput): Promise<HighlightSelection> {
    this.selectHighlightInputs.push(input)
    return Promise.resolve(this.highlightToReturn)
  }

  generateCopy(input: GenerateCopyInput): Promise<GenerateCopyResult> {
    this.generateCopyInputs.push(input)
    return Promise.resolve(this.copyResultToReturn)
  }
}
