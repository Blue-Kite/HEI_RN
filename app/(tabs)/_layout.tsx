import { Tabs, Link } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="aws"
                options={{
                    title: 'AWS',
                }}
            />
        </Tabs>
    );
}
