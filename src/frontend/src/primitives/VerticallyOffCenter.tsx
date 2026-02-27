import { type ReactNode } from "react"
import { Div } from "./Div"

export const VerticallyOffCenter = ({ children }: { children: ReactNode }) => {
     return (
          <Div display="flex" flexDirection="column" width="full" height="full">
               <Div flex="1 1 35%" pointerEvents="none" />
               <Div width="full" flex="1">
                    {children}
               </Div>
               <Div flex="1" pointerEvents="none" />
               <Div flex="1 1 65%" pointerEvents="none" />
          </Div>
     )
}