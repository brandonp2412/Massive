import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Button, IconButton, List } from "react-native-paper";
import AppFab from "./AppFab";
import DrawerHeader from "./DrawerHeader";
import { LIMIT, PADDING } from "./constants";
import GymSet, { defaultSet } from "./gym-set";
import { getNow, setRepo, settingsRepo } from "./db";
import { NavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import { Like } from "typeorm";
import Settings from "./settings";
import { format } from "date-fns";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import SetItem from "./SetItem";
import { StackParams } from "./AppStack";

export default function Daily() {
    const [sets, setSets] = useState<GymSet[]>();
    const [day, setDay] = useState<Date>()
    const [settings, setSettings] = useState<Settings>();
    const navigation = useNavigation<NavigationProp<StackParams>>();

    const mounted = async () => {
        const now = await getNow();
        let created = now.split('T')[0];
        setDay(new Date(created));
    }

    useEffect(() => {
        mounted();
    }, [])

    const refresh = async () => {
        if (!day) return;
        const created = day.toISOString().split('T')[0]
        const newSets = await setRepo.find({
            where: { hidden: 0 as any, created: Like(`${created}%`) },
            take: LIMIT,
            skip: 0,
            order: { created: "DESC" },
        });
        setSets(newSets);
        settingsRepo.findOne({ where: {} }).then(setSettings)
    }

    useEffect(() => {
        refresh();
    }, [day])

    useFocusEffect(useCallback(() => {
        refresh();
    }, [day]))

    const onAdd = async () => {
        const now = await getNow();
        let set: Partial<GymSet> = { ...sets[0] };
        if (!set) set = { ...defaultSet };
        set.created = now;
        delete set.id;
        navigation.navigate("EditSet", { set });

    }

    const onRight = () => {
        const newDay = new Date(day)
        newDay.setDate(newDay.getDate() + 1)
        setDay(newDay)
    }

    const onLeft = () => {
        const newDay = new Date(day)
        newDay.setDate(newDay.getDate() - 1)
        setDay(newDay)
    }

    const onDate = () => {
        DateTimePickerAndroid.open({
            value: new Date(day),
            onChange: (event, date) => {
                if (event.type === 'dismissed') return;
                setDay(date)
            },
            mode: 'date',
        })
    }

    return (
        <>
            <DrawerHeader name="Daily" />


            <View style={{ padding: PADDING, flexGrow: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <IconButton style={{ marginRight: 'auto' }} icon="chevron-double-left" onPress={onLeft} />
                    <Button onPress={onDate}>{format(day ? new Date(day) : new Date(), "PPPP")}</Button>
                    <IconButton style={{ marginLeft: 'auto' }} icon="chevron-double-right" onPress={onRight} />
                </View>

                {settings && (
                    <FlatList ListEmptyComponent={<List.Item title="No sets yet" />} style={{ flex: 1 }} data={sets} renderItem={({ item }) => <SetItem ids={[]} setIds={() => { }} item={item} settings={settings} />} />
                )}

                <AppFab onPress={onAdd} />
            </View>


        </>
    )
}