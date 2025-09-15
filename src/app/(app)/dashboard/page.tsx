"use client"
import {useMemo, useEffect, useRef, useState} from "react";
import {Heart, LoaderCircle, MessageCircle} from "lucide-react";
import DatePicker from "@/components/ui/date-picker";
import {CalendarDate} from "@internationalized/date";
import {ZONE_ID} from "@/constants";
import {AreaData, AreaSeries, AreaSeriesPartialOptions, ColorType, createChart, SingleValueData} from "lightweight-charts";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Separator} from "@/components/ui/separator";
import {useSidebar} from "@/components/ui/sidebar";
import {BreadcrumbLayout} from "@/components/design/breadcrumb/breadcrumb-layout";
import {Tip} from "@/app/(app)/dashboard/tips/definitions";
import {topTipsAction} from "@/app/(app)/dashboard/tips/actions";
import {useQuery} from "@tanstack/react-query";
import {ErrorDescription} from "@/lib/errors";
import {TopTips} from "@/app/(app)/dashboard/_components/top-tips";
import {Post, TopPostsDto} from "@/app/(app)/dashboard/posts/definitions";
import {useSession} from "next-auth/react";
import {Authority, User} from "@/app/(app)/dashboard/users/definitions";
import {topPostsAction} from "@/app/(app)/dashboard/posts/actions";
import {findUsersAction, pageUsersAction} from "@/app/(app)/dashboard/users/actions";
import {Appointment, AppointmentType} from "@/app/(app)/dashboard/appointments/definitions";
import {useAppointments} from "@/app/(app)/dashboard/appointments/_hooks/use-appointments";
import {ComboboxQuery, fromPage} from "@/components/ui/combobox";
import {Label} from "@/components/ui/label";


export default function Page() {
  const session = useSession();
  const authorities = session.data?.authorities as string[]
  
  return (
    <BreadcrumbLayout homePage="/" breadcrumbs={[]}>
      <h1 className="text-2xl font-semibold mb-3.5">Dashboard</h1>
      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments">Citas</TabsTrigger>
          <TabsTrigger value="posts">Publicaciones</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>
        <Separator className="my-3"/>
        <TabsContent value="appointments">
          <AppointmensCharts authorities={authorities}/>
        </TabsContent>
        <TabsContent value="posts">
          <TopPosts/>
        </TabsContent>
        <TabsContent value="tips">
          <Tips/>
        </TabsContent>
      </Tabs>
    </BreadcrumbLayout>
  );
}


function Tips() {
  
  const query = useQuery<Tip[], ErrorDescription>({
    queryKey: ['tips', 'top'],
    queryFn: async () => await topTipsAction().unwrap(),
  })
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Tips</CardTitle>
      </CardHeader>
      <CardContent>
        {query.isFetching && (
          <div className="flex items-center justify-center">
            AAA
            <LoaderCircle className="w-5 h-5 animate-spin"/>
          </div>
        )}
        {query.isError && <p className="text-destructive">Error al cargar los tips: {query.error.description}</p>}
        {query.isSuccess && query.data && (
          query.data.length === 0
            ? <p className="text-muted-foreground">No hay tips disponibles</p>
            : <TopTips tips={query.data}/>
        )}
      </CardContent>
    </Card>
  );
}


function TopPosts() {
  
  const query = useQuery<TopPostsDto, ErrorDescription>({
    queryKey: ['posts', 'top'],
    queryFn: async () => await topPostsAction().unwrap(),
  });
  
  console.log("Is fetching top posts?", query.isFetching);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicaciones Destacadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <PostView
              title="Publicación más gustada"
              post={query?.data?.mostLikedPost}
              loading={query.isFetching}
              emptyMessage="No hay publicaciones gustadas aún"
            />
          </div>
          <div className="col-span-1">
            <PostView
              title="Publicación más comentada"
              post={query?.data?.mostCommentedPost}
              loading={query.isFetching}
              emptyMessage="No hay publicaciones comentadas aún"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
      
      </CardFooter>
    </Card>
  );
}

interface PostViewProps {
  title: string;
  post?: Post | null;
  loading: boolean;
  emptyMessage?: string;
}

function PostView({title, post, loading, emptyMessage = "No hay publicaciones"}: Readonly<PostViewProps>) {
  
  const hasAuthor = post?.author != null;
  
  const query = useQuery<User, ErrorDescription>({
    queryKey: ['users', 'by-id', post?.author],
    queryFn: async () => await findUsersAction(post!.author!).unwrap(),
    enabled: hasAuthor,
  });
  
  const buildAuthorSection = () => {
    if (query.isFetching) {
      return (
        <div className="flex items-center justify-center">
          <LoaderCircle className="w-5 h-5 animate-spin"/>
        </div>
      );
    }
    if (query.isSuccess) {
      const author = query.data;
      return (
        <div className="flex items-center gap-2">
          <p className="text-sm">{author.firstName + ' ' + author.lastName}</p>
          <p className="text-xs text-muted-foreground">{author.email}</p>
        </div>
      );
    }
    return <div>
      <p className="text-muted-foreground">Autor anónimo</p>
    </div>
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {buildAuthorSection()}
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        {loading && (
          <div className="flex items-center justify-center">
            <LoaderCircle className="w-5 h-5 animate-spin"/>
          </div>
        )}
        
        {!loading && !post && (
          <p className="text-muted-foreground">{emptyMessage}</p>
        )}
        
        {!loading && post && (
          <div className="space-y-2">
            <p className="text-sm">{post.content}</p>
            <p className="text-xs text-muted-foreground">
              {post.createdAt.toString()}
            </p>
          </div>
        )}
      </CardContent>
      {!loading && post && (
        <CardFooter className="flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4"/>
            {post.likedBy.length} Likes
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4"/>
            {post.comments.length} Comentarios
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

const appointmenAreaConfig: AreaSeriesPartialOptions = {
  topColor: '#2962FF',
  bottomColor: 'rgba(41, 98, 255, 0.28)',
  lineColor: '#2962FF',
  lineWidth: 2,
  title: 'Cantidad de citas',
};

const currentYear = new Date().getFullYear();

function AppointmensCharts({authorities}: Readonly<{ authorities: string[] }>) {
  
  const {query, filters} = useAppointments({
    initialState: {
      range: {
        from: new CalendarDate(currentYear, 1, 1),
        to: new CalendarDate(currentYear, 12, 31),
      }
    }
  });
  
  const [groupMode, setGroupMode] = useState<GroupMode>(GroupMode.DAY);
  
  const [allData, presentialData, virtualData] = useMemo(() => {
    const appointments = query.data || [];
    const range = {
      from: filters.range.from.toDate(ZONE_ID),
      to: filters.range.to.toDate(ZONE_ID)
    };
    return [
      appointmentsToData(appointments, groupMode, range),
      appointmentsToData(appointments.filter(a => a.type === AppointmentType.PRESENTIAL), groupMode, range),
      appointmentsToData(appointments.filter(a => a.type === AppointmentType.VIRTUAL), groupMode, range),
    ];
  }, [filters.range, groupMode, query.data]);
  
  const hasPrivileges = authorities?.some(a => ['ROLE_admin', 'ROLE_administrative'].includes(a));
  
  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-center justify-center my-5">
          {hasPrivileges && <>
            <SelectProfessionalType
              value={filters.professionalType}
              onChange={filters.setProfessionalType}
              disabled={!!filters.professional}
            />
            <div className="w-60">
              <ComboboxQuery<User>
                queryKey={['users', 'professionals']}
                className="w-full"
                value={filters.professional}
                onSelect={filters.setProfessional}
                queryFn={fromPage((search) => pageUsersAction({
                  search,
                  page: 0,
                  size: 15,
                  query: `authorities=in=(${Authority.MEDICAL_PROFESSIONAL},${Authority.LEGAL_PROFESSIONAL})`
                }))}
                toOption={(professional) => ({
                  value: professional.id.toString(),
                  label: `${professional.firstName} ${professional.lastName}`
                })}
              />
            </div>
          </>}
          <div className="grid gap-2">
            <Label>Desde</Label>
            <DatePicker<CalendarDate>
              value={filters.range.from}
              defaultValue={filters.range.from}
              onChange={(date) => filters.setRange({from: date as CalendarDate, to: filters.range.to})}
            />
          </div>
          <div className="grid gap-2">
            <Label>Hasta</Label>
            <DatePicker<CalendarDate>
              value={filters.range.to}
              defaultValue={filters.range.to}
              onChange={(date) => filters.setRange({from: filters.range.from, to: date as CalendarDate})}
            />
          </div>
          <div className="w-60">
            <SelectGroupMode value={groupMode} onChange={setGroupMode}/>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <AppointmentsAreaChart
              title="Todas las citas"
              loading={query.isFetching}
              data={allData}
              groupMode={groupMode}
            />
          </div>
          <div className="col-span-1">
            <AppointmentsAreaChart
              title="Citas Presenciales"
              loading={query.isFetching}
              data={presentialData}
              groupMode={groupMode}
            />
          </div>
          <div className="col-span-1">
            <AppointmentsAreaChart
              title="Citas Virtuales"
              loading={query.isFetching}
              data={virtualData}
              groupMode={groupMode}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SelectProfessionalTypeProps {
  value: Authority | null;
  onChange: (value: Authority.LEGAL_PROFESSIONAL | Authority.MEDICAL_PROFESSIONAL | null) => void;
  disabled: boolean;
}

function SelectProfessionalType({value, onChange, disabled}: Readonly<SelectProfessionalTypeProps>) {
  return (
    <Select
      disabled={disabled}
      value={value ?? "ANY"}
      onValueChange={(value) => value === "ANY" ? onChange(null) : onChange(value as Authority.LEGAL_PROFESSIONAL | Authority.MEDICAL_PROFESSIONAL)}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Tipo de profesional"/>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={"ANY"}>
          <p>Cualquiera</p>
        </SelectItem>
        <SelectItem value={Authority.MEDICAL_PROFESSIONAL}>
          <p>Médico</p>
        </SelectItem>
        <SelectItem value={Authority.LEGAL_PROFESSIONAL}>
          <p>Abogado</p>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}


interface AppointmentsAreaChartProps {
  title: string;
  loading: boolean;
  data: AreaData[];
  groupMode: GroupMode;
}

function AppointmentsAreaChart({title, loading, data, groupMode}: Readonly<AppointmentsAreaChartProps>) {
  
  const {open} = useSidebar();
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const legendContainerRef = useRef<HTMLParagraphElement | null>(null);
  
  useEffect(() => {
    const current = chartContainerRef.current;
    if (!current) return;
    
    const handleResize = () => {
      chart.applyOptions({width: current.clientWidth,});
    };
    
    const chart = createChart(current, {
      layout: {
        attributionLogo: false,
        background: {
          type: ColorType.Solid,
          color: 'rgba(255,255,255,0)',
        },
        textColor: '#8C9BA5',
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        }
      },
      localization: {
        locale: 'es-ES',
      },
      height: 250,
      width: current.clientWidth,
    });
    
    chart.timeScale().fitContent();
    
    const series = chart.addSeries(AreaSeries, appointmenAreaConfig);
    series.setData(data);
    
    
    chart.subscribeCrosshairMove(evt => {
      const data = evt.seriesData.get(series) as SingleValueData;
      
      if (data && typeof data.time === 'string') {
        const date = new Date(data.time);
        const formattedDate = {
          [GroupMode.YEAR]: date.getFullYear(),
          [GroupMode.MONTH]: `${date.toLocaleDateString('es-ES', {month: 'long'})} ${date.getFullYear()}`,
          [GroupMode.WEEK]: `Semana del ${date.toLocaleDateString('es-ES', {day: 'numeric', month: 'long'})}`,
          [GroupMode.DAY]: date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        }[groupMode] || 'Fecha';
        
        legendContainerRef.current!.textContent = `${formattedDate}: ${data.value} citas`;
      }
    });
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, groupMode, open]);
  
  
  return (
    <Card>
      <CardHeader>
        {title}
      </CardHeader>
      <CardContent>
        <div
          className="relative w-full"
          ref={chartContainerRef}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {loading && <LoaderCircle className="w-5 h-5 animate-spin"/>}
          </div>
          <div className="absolute top-2 left-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3"/>
              <p ref={legendContainerRef} className="text-sm font-semibold"></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export interface SelectGroupModeProps {
  value?: GroupMode;
  onChange: (value: GroupMode) => void;
}

export function SelectGroupMode({value, onChange}: Readonly<SelectGroupModeProps>) {
  return (
    <Select
      value={value}
      onValueChange={(value) => onChange(value as GroupMode)}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Tipo de cita"/>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DAY">
          <p>Día</p>
        </SelectItem>
        <SelectItem value="WEEK">
          <p>Semana</p>
        </SelectItem>
        <SelectItem value="MONTH">
          <p>Mes</p>
        </SelectItem>
        <SelectItem value="YEAR">
          <p>Año</p>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function appointmentsToData(appointments: Appointment[], groupMode: GroupMode, range: { from?: Date, to?: Date }): AreaData[] {
  const now = new Date();
  const effectiveTo = range.to && range.to > now ? now : range.to;
  
  const sorted = [...appointments].sort((a, b) => a.date.compare(b.date));
  
  const groupedData = new Map<string, number>();
  const dateGenerator = createDateGenerator(groupMode);
  
  const {from} = range;
  if (from && effectiveTo) {
    let currentDate = new Date(from);
    while (currentDate <= effectiveTo) {
      const groupKey = dateGenerator(currentDate);
      groupedData.set(groupKey, 0);
      currentDate = getNextDate(currentDate, groupMode);
    }
  }
  
  sorted.forEach(appointment => {
    const groupKey = dateGenerator(appointment.date.toDate(ZONE_ID));
    groupedData.set(groupKey, (groupedData.get(groupKey) ?? 0) + 1);
  });
  
  return Array
  .from(groupedData, ([time, value]) => ({time, value}))
  .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

function createDateGenerator(groupMode: GroupMode): (date: Date) => string {
  switch (groupMode) {
    case GroupMode.YEAR:
      return (date) => new Date(date.getFullYear(), 0, 1).toISOString().split('T')[0];
    case GroupMode.MONTH:
      return (date) => new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    case GroupMode.WEEK:
      return (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return startOfWeek.toISOString().split('T')[0];
      };
    case GroupMode.DAY:
    default:
      return (date) => date.toISOString().split('T')[0];
  }
}

function getNextDate(date: Date, groupMode: GroupMode): Date {
  const newDate = new Date(date);
  switch (groupMode) {
    case GroupMode.YEAR:
      newDate.setFullYear(newDate.getFullYear() + 1);
      break;
    case GroupMode.MONTH:
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case GroupMode.WEEK:
      newDate.setDate(newDate.getDate() + 7);
      break;
    case GroupMode.DAY:
    default:
      newDate.setDate(newDate.getDate() + 1);
      break;
  }
  return newDate;
}

enum GroupMode {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}
