import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";


import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/renderer/components/ui/table"
import { Button } from "@/renderer/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@/renderer/components/ui/collapsible";
import { ClassQuota, UstClass } from "@/types";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { useUstClient } from "@/renderer/hooks/use-ust-client";

export type CourseCardProps = { course: ClassQuota, term: string, selectedCourse: ClassQuota, setSelectedCourse: (course: ClassQuota) => void, setSection: (section: UstClass) => void };

export function CourseCard({ course, term, selectedCourse, setSelectedCourse, setSection }: CourseCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ustClient = useUstClient();

  useEffect(() => {
    console.log(selectedCourse);
    if (selectedCourse != course)
      setIsOpen(false);
  }, [selectedCourse])

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open)
          setSelectedCourse(course);
        else if (!open && selectedCourse == course)
          setSelectedCourse(null);
      }}
      className="flex flex-col gap-2"
    >
      <CollapsibleTrigger asChild>
        <div className="flex flex-row items-center gap-8 px-4 py-5">
          <div className="order-2 flex items-center gap-2 md:order-none">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">
                {course.subject} {course.catalogNbr}
              </h3>
              <p className="text-sm text-muted-foreground">{course.crseDesc}</p>
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col px-4 gap-2">
        <Table>
          <TableHeader>
          </TableHeader>
          <TableBody>
            {course.classes.map((section) => (
              <TableRow key={section.classNbr} onMouseOut={() => setSection(null)} onMouseOver={() => setSection(section)}>
                <TableCell className="font-medium">{section.section}</TableCell>
                <TableCell>{section.enrlTot}/{section.enrlCap} ({section.waitTot})</TableCell>
                <TableCell>{section.componentType == "Y" &&
                  <Button onClick={async () => { const data = await ustClient.enrol.cart_add(term, [section.classNbr]); console.log(data) }} className="p-2">
                    <ShoppingCart />
                  </Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      </CollapsibleContent>
    </Collapsible>
  );
}
