import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Image, Pressable, ScrollView, StatusBar, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Page = "home" | "record" | "processing" | "lesson" | "calendar" | "library";
type Homework = { id: number; text: string; done: boolean };

const C = {
  ink: "#25213B", muted: "#827E92", purple: "#6C4DFF", purpleDark: "#5036D6",
  lime: "#C8FF4D", paper: "#F8F7F2", white: "#FFFFFF", line: "#ECEAF2",
  lavender: "#F0EDFF", green: "#EAF7D3", orange: "#FFF1D8", red: "#FFE8E5",
};
const seedTitle = "แรงและการเคลื่อนที่";
const seedSummary = "แรงลัพธ์เป็นผลรวมของแรงทั้งหมดที่กระทำต่อวัตถุ ถ้าแรงลัพธ์ไม่เป็นศูนย์ วัตถุจะเปลี่ยนแปลงการเคลื่อนที่ โดยทิศของความเร่งเป็นทิศเดียวกับแรงลัพธ์";
const seedTopics = ["แรงลัพธ์และแรงเสียดทาน", "กฎการเคลื่อนที่ของนิวตัน", "ตัวอย่างแรงในชีวิตประจำวัน"];
const seedHomework: Homework[] = [
  { id: 1, text: "แบบฝึกหัดหน้า 42 ข้อ 1–5", done: false },
  { id: 2, text: "สรุปกฎของนิวตัน 3 ข้อ ส่งวันศุกร์", done: false },
];
const initialTranscript = "ครู: วันนี้เราจะเรียนเรื่องแรงและการเคลื่อนที่นะครับ\nครู: แรงลัพธ์เป็นผลรวมของแรงที่กระทำกับวัตถุ\nครู: ถ้าแรงไม่สมดุล วัตถุจะเกิดความเร่ง\nครู: อย่าลืมทำแบบฝึกหัดหน้า 42 ข้อหนึ่งถึงห้าด้วยนะครับ";

function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[{ backgroundColor: C.white, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: C.line }, style]}>{children}</View>;
}
function Label({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[{ color: C.ink, fontSize: 16, fontWeight: "800" }, style]}>{children}</Text>;
}
function Button({ title, onPress, secondary = false, darkText = false, style }: { title: string; onPress: () => void; secondary?: boolean; darkText?: boolean; style?: object }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [{ minHeight: 52, borderRadius: 17, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", backgroundColor: secondary ? C.white : C.purple, borderWidth: secondary ? 1 : 0, borderColor: C.line, opacity: pressed ? 0.82 : 1 }, style]}><Text style={{ color: secondary || darkText ? C.ink : C.white, fontWeight: "800", fontSize: 15 }}>{title}</Text></Pressable>;
}
function Chip({ text, color = C.lavender, ink = C.purple }: { text: string; color?: string; ink?: string }) {
  return <View style={{ backgroundColor: color, borderRadius: 30, paddingHorizontal: 11, paddingVertical: 6, alignSelf: "flex-start" }}><Text style={{ color: ink, fontSize: 11, fontWeight: "800" }}>{text}</Text></View>;
}

export default function HomeScreen() {
  const [page, setPage] = useState<Page>("home");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<"" | "permission" | "silent" | "failed">("");
  const [title, setTitle] = useState(seedTitle);
  const [summary, setSummary] = useState(seedSummary);
  const [topics, setTopics] = useState(seedTopics);
  const [homework, setHomework] = useState(seedHomework);
  const [editing, setEditing] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [filter, setFilter] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  const timeLabel = useMemo(() => `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`, [elapsed]);
  const go = (next: Page) => { setError(""); setPage(next); };
  const beginRecording = () => { setError(""); setElapsed(0); setRecording(true); go("record"); };
  const finishRecording = () => { setRecording(false); go("processing"); setTimeout(() => go("lesson"), 1400); };
  const retry = () => { setError(""); go("record"); setRecording(true); };
  const addHomework = () => setHomework((items) => [...items, { id: Date.now(), text: "แตะเพื่อพิมพ์ภาระงานใหม่", done: false }]);
  const toggleHomework = (id: number) => setHomework((items) => items.map((item) => item.id === id ? { ...item, done: !item.done } : item));
  const editTopic = (index: number, value: string) => setTopics((items) => items.map((topic, i) => i === index ? value : topic));
  const removeTopic = (index: number) => setTopics((items) => items.filter((_, i) => i !== index));
  const saveLesson = () => { setSaved(true); setEditing(false); go("calendar"); };

  const header = (eyebrow: string, heading: string, back?: () => void) => (
    <View style={{ marginBottom: 22 }}>
      {back ? <Pressable onPress={back} style={{ marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 7 }}><Text style={{ color: C.purple, fontSize: 20 }}>‹</Text><Text style={{ color: C.purple, fontWeight: "800" }}>กลับ</Text></Pressable> : null}
      <Text style={{ color: C.purple, fontSize: 11, letterSpacing: 1.2, fontWeight: "900", marginBottom: 6 }}>{eyebrow.toUpperCase()}</Text>
      <Text style={{ color: C.ink, fontSize: 26, lineHeight: 34, fontWeight: "900" }}>{heading}</Text>
    </View>
  );

  const lessonCard = (compact = false) => (
    <Pressable onPress={() => go("lesson")}>
      <Card style={{ padding: compact ? 15 : 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}><Chip text="วิทยาศาสตร์ · ม.2/1"/><Text style={{ color: C.muted, fontSize: 11 }}>09:00–10:00</Text></View>
        <Label style={{ fontSize: compact ? 16 : 18, marginBottom: 6 }}>{title}</Label>
        <Text numberOfLines={2} style={{ color: C.muted, fontSize: 13, lineHeight: 21 }}>{summary}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginTop: 12 }}><Text style={{ color: C.purple, fontSize: 12, fontWeight: "800" }}>มีภาระงาน {homework.length} รายการ</Text><Text style={{ color: C.muted }}>·</Text><Text style={{ color: C.muted, fontSize: 12 }}>แตะเพื่อดูรายละเอียด →</Text></View>
      </Card>
    </Pressable>
  );

  const content = () => {
    if (page === "record") return <>
      {header("กำลังบันทึก · วิทยาศาสตร์ ม.2/1", "ตั้งใจฟังได้เลย\nเราจดให้เอง", () => { setRecording(false); go("home"); })}
      <Card style={{ alignItems: "center", paddingVertical: 28, backgroundColor: C.lavender }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: C.purple, alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Text style={{ color: C.lime, fontSize: 30 }}>〰</Text></View>
        <Text style={{ color: C.purple, fontSize: 30, fontWeight: "900", fontVariant: ["tabular-nums"] }}>{timeLabel}</Text>
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>ไมโครโฟนพร้อม · บันทึกตัวอย่าง</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, height: 38, marginTop: 14 }}>{[12, 22, 15, 31, 19, 27, 13, 33, 20, 29, 14, 25, 17].map((h, i) => <View key={i} style={{ width: 4, height: h, borderRadius: 3, backgroundColor: i % 2 ? C.purple : "#9B87FF" }} />)}</View>
      </Card>
      <Label style={{ marginTop: 22, marginBottom: 10 }}>ได้ยินอะไรบ้าง</Label>
      <Card><Text style={{ color: C.ink, fontSize: 14, lineHeight: 24 }}>{transcript.split("\n").slice(0, 3).join("\n")}</Text><Text style={{ color: C.purple, fontSize: 11, marginTop: 10, fontWeight: "700" }}>● ถอดเสียงแบบจำลอง · ต่อเนื่อง</Text></Card>
      {error ? <Card style={{ marginTop: 12, backgroundColor: C.red }}><Label style={{ fontSize: 14 }}>{error === "permission" ? "ยังไม่ได้อนุญาตไมโครโฟน" : error === "silent" ? "ยังไม่พบเสียงพูด" : "การประมวลผลสะดุดเล็กน้อย"}</Label><Text style={{ color: C.muted, marginTop: 4, marginBottom: 10 }}>ไม่เป็นไร ลองใหม่ได้ หรือดูตัวอย่างสรุปต่อเลย</Text><Button title="ลองอีกครั้ง" onPress={retry} /></Card> : null}
      <Button title="หยุดและดูสรุป  →" onPress={finishRecording} style={{ marginTop: 18 }} />
      <View style={{ flexDirection: "row", gap: 9, marginTop: 10 }}><Button title="จำลองไม่มีเสียง" secondary onPress={() => setError("silent")} style={{ flex: 1 }} /><Button title="จำลองขัดข้อง" secondary onPress={() => setError("failed")} style={{ flex: 1 }} /></View>
      <Pressable onPress={() => { setRecording(false); setError("permission"); }} style={{ paddingVertical: 12, alignItems: "center" }}><Text style={{ color: C.muted, fontSize: 12 }}>จำลองสถานะยังไม่ได้อนุญาตไมโครโฟน</Text></Pressable>
    </>;

    if (page === "processing") return <View style={{ flex: 1, justifyContent: "center", paddingVertical: 80 }}>
      <View style={{ width: 90, height: 90, backgroundColor: C.lavender, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 24, alignSelf: "center" }}><Text style={{ fontSize: 38 }}>✦</Text></View>
      {header("สรุปบทเรียน", "กำลังจัดระเบียบ\nสิ่งที่เรียนวันนี้")}
      {["ถอดเสียงจากห้องเรียน", "จับหัวข้อและใจความสำคัญ", "ค้นหาภาระงานและกำหนดส่ง"].map((item, i) => <View key={item} style={{ flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.line }}><Text style={{ color: C.purple, fontSize: 17 }}>{i === 0 ? "✓" : "◌"}</Text><Text style={{ color: C.ink, fontWeight: "700" }}>{item}</Text></View>)}
      <Text style={{ color: C.muted, textAlign: "center", marginTop: 22, fontSize: 12 }}>ตัวอย่าง AI · อีกสักครู่เสร็จแล้ว</Text><Button title="ดูผลลัพธ์เลย  →" onPress={() => go("lesson")} style={{ marginTop: 18 }} />
    </View>;

    if (page === "lesson") return <>
      {header("สรุปบทเรียน · วันนี้", "เช็กสรุปนิดเดียว\nแล้วเก็บเข้าปฏิทิน", () => go("home"))}
      <Card style={{ backgroundColor: C.lavender, marginBottom: 15 }}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Chip text="AI สรุปให้แล้ว" color={C.lime} ink={C.ink}/><Pressable onPress={() => setEditing((v) => !v)}><Text style={{ color: C.purple, fontWeight: "900" }}>{editing ? "เสร็จแล้ว ✓" : "✎  แก้ไข"}</Text></Pressable></View>
        {editing ? <TextInput value={title} onChangeText={setTitle} style={{ color: C.ink, fontSize: 19, fontWeight: "900", marginTop: 12, paddingVertical: 8, borderBottomWidth: 1, borderColor: C.purple }} /> : <Label style={{ fontSize: 19, marginTop: 12 }}>{title}</Label>}
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>วิทยาศาสตร์ · ม.2/1  ·  วันนี้ 09:00</Text>
      </Card>
      <Label style={{ marginBottom: 9 }}>หัวข้อสำคัญ</Label>
      <Card style={{ marginBottom: 15, gap: 10 }}>{topics.map((topic, i) => <View key={`${i}-${topic}`} style={{ flexDirection: "row", gap: 9, alignItems: "center" }}><Text style={{ color: C.purple, fontWeight: "900" }}>✦</Text>{editing ? <TextInput value={topic} onChangeText={(v) => editTopic(i, v)} style={{ flex: 1, paddingVertical: 4, color: C.ink, borderBottomWidth: 1, borderColor: C.line }} /> : <Text style={{ color: C.ink, flex: 1, lineHeight: 20 }}>{topic}</Text>}{editing ? <Pressable onPress={() => removeTopic(i)}><Text style={{ color: "#D95D55", fontSize: 19 }}>−</Text></Pressable> : null}</View>)}
        {editing ? <Pressable onPress={() => setTopics((items) => [...items, "หัวข้อใหม่"])}><Text style={{ color: C.purple, fontWeight: "800", marginTop: 4 }}>＋ เพิ่มหัวข้อ</Text></Pressable> : null}</Card>
      <Label style={{ marginBottom: 9 }}>สรุปเนื้อหา</Label>
      <Card style={{ marginBottom: 15 }}>{editing ? <TextInput multiline value={summary} onChangeText={setSummary} style={{ color: C.ink, fontSize: 14, lineHeight: 23, minHeight: 110, textAlignVertical: "top" }} /> : <Text style={{ color: C.ink, fontSize: 14, lineHeight: 23 }}>{summary}</Text>}</Card>
      <Label style={{ marginBottom: 9 }}>ภาระงาน <Text style={{ color: C.muted, fontSize: 12, fontWeight: "500" }}>· กำหนดส่ง ศุกร์นี้</Text></Label>
      <Card style={{ marginBottom: 15, gap: 9 }}>{homework.map((item) => <View key={item.id} style={{ flexDirection: "row", alignItems: "center", gap: 9 }}><Pressable onPress={() => toggleHomework(item.id)} style={{ width: 21, height: 21, borderRadius: 7, borderWidth: 1.5, borderColor: item.done ? C.purple : "#C9C5D5", alignItems: "center", justifyContent: "center", backgroundColor: item.done ? C.purple : C.white }}><Text style={{ color: C.white, fontSize: 13 }}>{item.done ? "✓" : ""}</Text></Pressable>{editing ? <TextInput value={item.text} onChangeText={(v) => setHomework((items) => items.map((t) => t.id === item.id ? { ...t, text: v } : t))} style={{ flex: 1, color: C.ink, paddingVertical: 4, borderBottomWidth: 1, borderColor: C.line }} /> : <Text style={{ flex: 1, color: item.done ? C.muted : C.ink, textDecorationLine: item.done ? "line-through" : "none", lineHeight: 21 }}>{item.text}</Text>}{editing ? <Pressable onPress={() => setHomework((items) => items.filter((t) => t.id !== item.id))}><Text style={{ color: "#D95D55", fontSize: 18 }}>×</Text></Pressable> : null}</View>)}{editing ? <Pressable onPress={addHomework}><Text style={{ color: C.purple, fontWeight: "800", marginTop: 4 }}>＋ เพิ่มภาระงาน</Text></Pressable> : null}</Card>
      <Card style={{ backgroundColor: C.green, marginBottom: 16 }}><Text style={{ color: C.ink, fontWeight: "800" }}>💡 ลองทบทวน</Text><Text style={{ color: C.ink, marginTop: 6, lineHeight: 20 }}>ถ้าออกแรงสองทิศทางเท่ากัน แรงลัพธ์จะเป็นอย่างไร?</Text></Card>
      <Button title={saved ? "บันทึกแล้วในปฏิทิน ✓" : "ยืนยันและบันทึกลงปฏิทิน  →"} onPress={saveLesson} />
      <Pressable onPress={() => setTranscript(initialTranscript)} style={{ paddingVertical: 15, alignItems: "center" }}><Text style={{ color: C.purple, fontWeight: "700" }}>ดูข้อความถอดเสียงฉบับเต็ม</Text></Pressable>
    </>;

    if (page === "calendar") return <>
      {header("ปฏิทินเรียน", "วันนี้เราเรียน\nอะไรกันบ้าง?")}
      <Card style={{ backgroundColor: C.purple, marginBottom: 16, borderColor: C.purple }}><Text style={{ color: "#DDD6FF", fontSize: 12, fontWeight: "700" }}>วันศุกร์ · 16 ตุลาคม 2569</Text><Text style={{ color: C.white, fontSize: 24, fontWeight: "900", marginTop: 5 }}>2 คาบเรียน</Text><Text style={{ color: "#E5DFFF", fontSize: 12, marginTop: 3 }}>1 งานที่กำลังจะถึง</Text></Card>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>{["จ. 12", "อ. 13", "พ. 14", "พฤ. 15", "ศ. 16", "ส. 17", "อา. 18"].map((day, i) => <View key={day} style={{ alignItems: "center", gap: 6, paddingVertical: 9, paddingHorizontal: 4, width: 43, borderRadius: 16, backgroundColor: i === 4 ? C.lime : "transparent" }}><Text style={{ color: i === 4 ? C.ink : C.muted, fontSize: 10 }}>{day.split(" ")[0]}</Text><Text style={{ color: i === 4 ? C.ink : C.ink, fontSize: 13, fontWeight: "800" }}>{day.split(" ")[1]}</Text></View>)}</View>
      <View style={{ borderLeftWidth: 2, borderColor: C.line, marginLeft: 9, paddingLeft: 17, gap: 13 }}><View style={{ position: "absolute", left: -7, top: 16, width: 12, height: 12, borderRadius: 6, backgroundColor: C.purple }} /><Text style={{ color: C.muted, fontSize: 11, fontWeight: "800" }}>09:00 — 10:00</Text>{lessonCard(true)}<View style={{ position: "absolute", left: -7, bottom: 25, width: 12, height: 12, borderRadius: 6, backgroundColor: C.lime, borderWidth: 2, borderColor: C.white }} /><Text style={{ color: C.muted, fontSize: 11, fontWeight: "800", marginTop: 9 }}>กำหนดส่ง · ศุกร์นี้</Text><Card style={{ backgroundColor: C.orange }}><Text style={{ color: C.ink, fontWeight: "800" }}>☑  แบบฝึกหัดแรงและการเคลื่อนที่</Text><Text style={{ color: C.muted, marginTop: 5, fontSize: 12 }}>วิทยาศาสตร์ · {homework.filter((h) => !h.done).length} งานที่ยังไม่เสร็จ</Text></Card></View>
      <Pressable onPress={() => go("lesson")} style={{ marginTop: 16, alignSelf: "flex-end" }}><Text style={{ color: C.purple, fontWeight: "800" }}>เปิดสรุปบทเรียน →</Text></Pressable>
    </>;

    if (page === "library") {
      const rows = [title, "ระบบนิเวศและห่วงโซ่อาหาร", "สมการเชิงเส้นตัวแปรเดียว"].filter((name) => name.toLowerCase().includes(filter.toLowerCase()));
      return <>
        {header("คลังบทเรียน", "เก็บทุกคาบไว้\nกลับมาทบทวนได้")}
        <TextInput value={filter} onChangeText={setFilter} placeholder="ค้นหาวิชา หรือหัวข้อ…" placeholderTextColor="#9B97A8" style={{ backgroundColor: C.white, borderColor: C.line, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, height: 50, color: C.ink, marginBottom: 16 }} />
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 15 }}><Chip text="ทั้งหมด 12"/><Chip text="วิทยาศาสตร์" color={C.green} ink="#456C1A"/><Chip text="มีงาน 4" color={C.orange} ink="#A56A12"/></View>
        {rows.map((name, i) => <Pressable key={name} onPress={() => { setTitle(name); go("lesson"); }} style={{ marginBottom: 10 }}><Card><View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}><Chip text={i === 0 ? "วันนี้" : i === 1 ? "เมื่อวาน" : "12 ต.ค."}/><Text style={{ color: C.muted, fontSize: 11 }}>วิทยาศาสตร์</Text></View><Label>{name}</Label><Text style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>ม.2/1 · สรุปแล้ว · แตะเพื่อเปิด →</Text></Card></Pressable>)}
        {rows.length === 0 ? <Card><Text style={{ color: C.muted, textAlign: "center" }}>ไม่พบหัวข้อที่ค้นหา ลองพิมพ์คำอื่นดูนะ</Text></Card> : null}
      </>;
    }

    return <>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}><View style={{ flex: 1 }}><Text style={{ color: C.purple, fontSize: 13, fontWeight: "900" }}>Jumdaidee · จำได้ดี</Text><Text style={{ color: C.muted, fontSize: 11, fontWeight: "600", marginTop: 3 }}>วันศุกร์ที่ 16 ตุลาคม 2569</Text><Text style={{ color: C.ink, fontSize: 22, fontWeight: "900", marginTop: 5 }}>สวัสดี, นักเรียน 👋</Text></View><Image source={require("../../assets/images/icon.png")} style={{ width: 52, height: 52, borderRadius: 16 }} /></View>
      <Card style={{ backgroundColor: C.purple, borderColor: C.purple, padding: 21, marginBottom: 18 }}><View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Text style={{ color: C.lime, fontSize: 18 }}>✦</Text><Text style={{ color: "#E7E1FF", fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>Jumdaidee · จำได้ดี</Text></View><Text style={{ color: C.white, fontSize: 24, lineHeight: 32, fontWeight: "900", marginTop: 12 }}>ไม่ต้องพิมพ์\nแค่ตั้งใจฟัง</Text><Text style={{ color: "#E4DEFF", fontSize: 13, marginTop: 7, lineHeight: 20 }}>เราช่วยจด สรุป และเตือนงานให้เอง</Text><Button title="◉   เริ่มบันทึกบทเรียน" onPress={beginRecording} darkText style={{ marginTop: 17, backgroundColor: C.lime }} /><Text style={{ color: "#E4DEFF", fontSize: 10, textAlign: "center", marginTop: 9 }}>เดโม · เสียงและ AI เป็นข้อมูลตัวอย่าง</Text></Card>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}><Label>ตารางเรียนวันนี้</Label><Pressable onPress={() => go("calendar")}><Text style={{ color: C.purple, fontSize: 12, fontWeight: "800" }}>ดูทั้งหมด →</Text></Pressable></View>
      <Card style={{ marginBottom: 18, padding: 14 }}><View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}><View style={{ backgroundColor: C.lavender, borderRadius: 13, width: 45, height: 45, alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 20 }}>⚛</Text></View><View style={{ flex: 1 }}><Text style={{ color: C.ink, fontWeight: "800" }}>วิทยาศาสตร์ · ม.2/1</Text><Text style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>09:00 – 10:00  ·  ห้อง 204</Text></View><Chip text="เรียนแล้ว" color={C.green} ink="#4A751E"/></View><View style={{ height: 1, backgroundColor: C.line, marginVertical: 12 }}/><View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}><View style={{ backgroundColor: C.orange, borderRadius: 13, width: 45, height: 45, alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 20 }}>∑</Text></View><View style={{ flex: 1 }}><Text style={{ color: C.ink, fontWeight: "800" }}>คณิตศาสตร์ · ม.2/1</Text><Text style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>13:00 – 14:00  ·  ห้อง 204</Text></View><Chip text="อีก 2 ชม." color={C.orange} ink="#A56A12"/></View></Card>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}><Label>สรุปล่าสุด</Label><Pressable onPress={() => go("library")}><Text style={{ color: C.purple, fontSize: 12, fontWeight: "800" }}>คลังทั้งหมด →</Text></Pressable></View>
      {lessonCard(true)}
      <Card style={{ backgroundColor: C.lime, marginTop: 14, padding: 15 }}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><View><Text style={{ color: C.ink, fontWeight: "900" }}>📌  งานที่ต้องส่ง</Text><Text style={{ color: C.ink, fontSize: 12, marginTop: 4 }}>แบบฝึกหัดวิทย์ · วันนี้</Text></View><Text style={{ color: C.ink, fontWeight: "900", fontSize: 20 }}>{homework.filter((h) => !h.done).length}</Text></View></Card>
    </>;
  };

  const tabs: { id: Page; icon: string; label: string }[] = [{ id: "home", icon: "⌂", label: "หน้าหลัก" }, { id: "calendar", icon: "▦", label: "ปฏิทิน" }, { id: "library", icon: "▤", label: "บทเรียน" }];
  return <SafeAreaView style={{ flex: 1, backgroundColor: C.paper }} edges={["top", "left", "right"]}>
    <StatusBar barStyle="dark-content" />
    <View style={{ flex: 1, width: "100%", maxWidth: 480, alignSelf: "center" }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 26 }} showsVerticalScrollIndicator={false}>{content()}</ScrollView>
      {!(["record", "processing", "lesson"].includes(page)) ? <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.white, paddingTop: 9, paddingBottom: 9, justifyContent: "space-around" }}>{tabs.map((tab) => { const active = page === tab.id; return <Pressable key={tab.id} onPress={() => go(tab.id)} style={{ alignItems: "center", minWidth: 72, gap: 3 }}><Text style={{ color: active ? C.purple : C.muted, fontSize: 22, fontWeight: "800" }}>{tab.icon}</Text><Text style={{ color: active ? C.purple : C.muted, fontSize: 10, fontWeight: active ? "900" : "600" }}>{tab.label}</Text></Pressable>; })}</View> : null}
    </View>
  </SafeAreaView>;
}
