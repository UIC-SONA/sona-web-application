import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";

const defaultLength = 50;

export interface TruncateTextProps {
  text: string
  length?: number,
  expansionType?: 'modal' | 'inline'
}


export function TruncateText({text, expansionType = "inline", length = defaultLength}: Readonly<TruncateTextProps>) {
  const textRender = text.length > length ? text.substring(0, length) + "..." : text;
  
  if (expansionType === 'modal') {
    return (
      <Dialog>
        <DialogTrigger className="cursor-pointer text-start">
          {textRender}
        </DialogTrigger>
        <DialogContent className="text-start p-4 sm:max-w-[80vw]">
          <DialogTitle>{" "}</DialogTitle>
          <p className="text-sm">
            {text}
          </p>
        </DialogContent>
      </Dialog>
    )
  }
  return <p>{textRender}</p>
}
