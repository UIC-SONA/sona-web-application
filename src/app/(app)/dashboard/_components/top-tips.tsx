import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {FetchImage} from "@/components/ui/fetch-image";
import {getTipImageAction} from "@/app/(app)/dashboard/tips/actions";
import {Badge} from "@/components/ui/badge";
import {Tip} from "@/app/(app)/dashboard/tips/definitions";
import {Star} from "lucide-react";

export function TopTips({tips}: Readonly<{ tips: Tip[] }>) {
  const orderedTips = [...tips].sort((a, b) => b.averageRate - a.averageRate)
  
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {orderedTips.map(tip => <TipCard key={tip.id} tip={tip}/>)}
    </div>
  );
}

function TipCard({tip}: Readonly<{ tip: Tip }>) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle>{tip.title}</CardTitle>
        <CardDescription>{tip.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <FetchImage
            cacheKey={`tip-image-${tip.id}`}
            fetcher={() => getTipImageAction(tip.id)}
            alt={tip.title}
          />
        </div>
        <div>
          <StarRating rating={tip.averageRate}/>
          <div className="flex flex-wrap gap-2 mt-5">
            {tip.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Total ratings: {tip.totalRate}
        </p>
      </CardFooter>
    </Card>
  );
}

function StarRating({rating, maxRating = 5}: Readonly<{ rating: number, maxRating?: number }>) {
  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, index) => (
        <Star
          key={index + 1}
          className={`w-5 h-5 ${
            index < Math.round(rating)
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}
