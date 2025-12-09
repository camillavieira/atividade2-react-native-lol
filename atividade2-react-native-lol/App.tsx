import 'react-native-gesture-handler';
import * as React from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  Appbar,
  Card,
  Text,
  Button,
  ActivityIndicator,
  Icon,
} from 'react-native-paper';

import {
  NavigationContainer,
  DrawerActions,
  DefaultTheme as NavLight,
} from '@react-navigation/native';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// ------------------------
// Tipagem
// ------------------------
type Champion = {
  id: string;
  name: string;
  title: string;
  blurb: string;
};

type RootDrawerParamList = {
  Principal: undefined;
  Sobre: undefined;
};

type RootStackParamList = {
  Tabs: undefined;
  Detalhes: { champ: Champion } | undefined;
};


// ------------------------
// Navegação
// ------------------------
const Drawer = createDrawerNavigator<RootDrawerParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();


// ------------------------
// Temas
// ------------------------
const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: '#FAFAFA',
    surface: '#FFFFFF',
  },
};

const navTheme = {
  ...NavLight,
  colors: {
    ...NavLight.colors,
    background: '#FAFAFA',
    card: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
  },
};


// ------------------------
// Componentes de layout
// ------------------------
function Header({ title, navigation }: any) {
  return (
    <Appbar.Header mode="center-aligned">
      <Appbar.Action
        icon="menu"
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}

function ScreenContainer({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}


// ------------------------
// Tela Home → mostra campeões
// ------------------------
function HomeScreen({ navigation }: any) {
  const [champions, setChampions] = React.useState<Champion[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function loadData() {
    try {
      const version = "14.2.1";
      const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;

      const res = await fetch(url);
      const json = await res.json();

      const champs = Object.values(json.data); // transforma em array
      setChampions(champs as Champion[]);
    } catch (err) {
      console.log("ERRO ao carregar champions:", err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator size="large" />
        <Text>Carregando campeões...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={champions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            mode="elevated"
            style={{ marginBottom: 12 }}
            onPress={() => navigation.navigate("Detalhes", { champ: item })}
          >
            <Card.Title
              title={item.name}
              subtitle={item.title}
              left={(props) => (
                <Image
                  source={{
                    uri: `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/${item.id}.png`,
                  }}
                  style={{ width: 40, height: 40, borderRadius: 5, marginLeft: 10 }}
                />
              )}
            />
          </Card>
        )}
      />
    </ScreenContainer>
  );
}


// ------------------------
// Tela Feed (simples)
// ------------------------
function FeedScreen({ navigation }: any) {
  return (
    <ScreenContainer>
      <Card mode="elevated">
        <Card.Title
          title="Feed"
          left={(props) => <Icon {...props} source="rss" />}
        />
        <Card.Content>
          <Text>Exemplo de outra aba (Feed).</Text>
        </Card.Content>
      </Card>
    </ScreenContainer>
  );
}


// ------------------------
// Tabs (Home + Feed)
// ------------------------
function TabsScreen() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarIcon: ({ color, size }) => {
          const icon = route.name === "Home" ? "home" : "rss";
          return <Icon source={icon} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Feed" component={FeedScreen} />
    </Tabs.Navigator>
  );
}


// ------------------------
// Tela de Detalhes do Campeão
// ------------------------
function DetalhesScreen({ route, navigation }: any) {
  const champ = route.params?.champ;

  if (!champ) {
    return (
      <ScreenContainer>
        <Text>Nenhum campeão selecionado.</Text>
      </ScreenContainer>
    );
  }

  return (
    <>
      <Header title={champ.name} navigation={navigation} />
      <ScreenContainer>
        <Card>
          <Image
            source={{
              uri: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`,
            }}
            style={{ width: "100%", height: 200 }}
          />
          <Card.Content style={{ marginTop: 16 }}>
            <Text variant="headlineSmall">{champ.name}</Text>
            <Text variant="titleSmall">{champ.title}</Text>

            <Text style={{ marginTop: 12 }}>{champ.blurb}</Text>
          </Card.Content>

          <Card.Actions>
            <Button onPress={() => navigation.goBack()}>Voltar</Button>
          </Card.Actions>
        </Card>
      </ScreenContainer>
    </>
  );
}


// ------------------------
// Stack Principal (Tabs + Detalhes)
// ------------------------
function StackPrincipal({ navigation }: any) {
  return (
    <>
      <Header title="Campeões" navigation={navigation} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabsScreen} />
        <Stack.Screen name="Detalhes" component={DetalhesScreen} />
      </Stack.Navigator>
    </>
  );
}


// ------------------------
// Tela Sobre
// ------------------------
function SobreScreen({ navigation }: any) {
  return (
    <>
      <Header title="Sobre" navigation={navigation} />
      <ScreenContainer>
        <Card>
          <Card.Title
            title="Sobre o App"
            left={(props) => <Icon {...props} source="information" />}
          />
          <Card.Content>
            <Text>
              App React Native + Paper + Navegação usando API oficial do League of Legends.
            </Text>
          </Card.Content>
        </Card>
      </ScreenContainer>
    </>
  );
}


// ------------------------
// APP PRINCIPAL
// ------------------------
export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerActiveTintColor: '#2563EB',
          }}
        >
          <Drawer.Screen
            name="Principal"
            component={StackPrincipal}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon source="view-dashboard" size={size} color={color} />
              ),
            }}
          />

          <Drawer.Screen
            name="Sobre"
            component={SobreScreen}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon source="information-outline" size={size} color={color} />
              ),
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}


// ------------------------
// Estilos
// ------------------------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAFAFA',
    gap: 16,
  },
});
