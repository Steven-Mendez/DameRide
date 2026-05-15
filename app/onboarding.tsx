import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Car, CheckCircle2, ChevronDown, GraduationCap, IdCard, MapPin, Phone, Search, X, UserRound, UsersRound } from 'lucide-react-native';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { Colors, Shadows } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { createVehicle, updateProfile } from '@/src/lib/database';
import { formatNicaraguaPhoneInput, toNicaraguaPhoneStorage } from '@/src/utils/format';

const DEPARTMENTS = [
  'Boaco',
  'Carazo',
  'Chinandega',
  'Chontales',
  'Estelí',
  'Granada',
  'Jinotega',
  'León',
  'Madriz',
  'Managua',
  'Masaya',
  'Matagalpa',
  'Nueva Segovia',
  'Río San Juan',
  'Rivas',
  'Costa Caribe Norte',
  'Costa Caribe Sur',
];

const UNIVERSITIES = [
  'UNAN-Managua',
  'UNAN-León',
  'UCA',
  'UNI',
  'UNA',
  'UPOLI',
  'UAM',
  'Keiser University',
  'UNICA',
  'UCC',
  'UDO',
  'BICU',
  'URACCAN',
  'UCATSE',
];

const OTHER_UNIVERSITY_OPTION = 'Otra';

type Step = 0 | 1 | 2 | 3 | 4 | 5;
type FinishTarget = 'home' | 'vehicle';

const normalizeSearchText = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [step, setStep] = useState<Step>(0);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [departmentPickerVisible, setDepartmentPickerVisible] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [university, setUniversity] = useState('');
  const [universityPickerVisible, setUniversityPickerVisible] = useState(false);
  const [universitySearch, setUniversitySearch] = useState('');
  const [studentId, setStudentId] = useState('');
  const [customUniversity, setCustomUniversity] = useState('');
  const [saving, setSaving] = useState(false);

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [seats, setSeats] = useState('4');

  useEffect(() => {
    const metadataName = typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user?.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : '';

    setFullName(profile?.full_name ?? metadataName);
    setPhone(formatNicaraguaPhoneInput(profile?.phone ?? ''));
    setDepartment(profile?.city ?? '');

    const savedUniversity = profile?.university ?? '';
    if (savedUniversity && !UNIVERSITIES.includes(savedUniversity)) {
      setUniversity(OTHER_UNIVERSITY_OPTION);
      setCustomUniversity(savedUniversity);
    } else {
      setUniversity(savedUniversity);
      setCustomUniversity('');
    }
    setStudentId(profile?.student_id ?? '');
  }, [profile?.city, profile?.full_name, profile?.phone, profile?.student_id, profile?.university, user?.user_metadata?.full_name, user?.user_metadata?.name]);

  const parsedSeats = Number.parseInt(seats, 10);
  const canSaveVehicle = useMemo(() => {
    return Boolean(make.trim() && model.trim() && Number.isFinite(parsedSeats) && parsedSeats >= 1 && parsedSeats <= 8);
  }, [make, model, parsedSeats]);
  const filteredDepartments = useMemo(() => {
    const query = normalizeSearchText(departmentSearch.trim());
    if (!query) return DEPARTMENTS;
    return DEPARTMENTS.filter((item) => normalizeSearchText(item).includes(query));
  }, [departmentSearch]);
  const universityOptions = useMemo(() => [...UNIVERSITIES, OTHER_UNIVERSITY_OPTION], []);
  const filteredUniversities = useMemo(() => {
    const query = normalizeSearchText(universitySearch.trim());
    if (!query) return universityOptions;
    return universityOptions.filter((item) => normalizeSearchText(item).includes(query));
  }, [universityOptions, universitySearch]);

  const totalSteps = step === 5 ? 6 : 5;
  const progressStep = step + 1;

  const validateProfile = () => {
    if (!fullName.trim()) {
      Alert.alert('Nombre requerido', 'Agrega tu nombre completo para continuar.');
      return false;
    }

    const phoneForStorage = toNicaraguaPhoneStorage(phone.trim());
    if (!phoneForStorage) {
      Alert.alert('Telefono requerido', 'Ingresa un numero nicaraguense de 8 digitos para continuar.');
      return false;
    }

    return true;
  };

  const validateUniversity = () => {
    if (!university) {
      Alert.alert('Universidad requerida', 'Selecciona tu universidad para continuar.');
      return false;
    }
    if (university === OTHER_UNIVERSITY_OPTION && !customUniversity.trim()) {
      Alert.alert('Universidad requerida', 'Escribe el nombre de tu universidad para continuar.');
      return false;
    }
    if (!studentId.trim()) {
      Alert.alert('Carnet requerido', 'Ingresa tu carnet para continuar.');
      return false;
    }
    return true;
  };

  const saveProfileAndFinish = async (target: FinishTarget) => {
    if (!user) {
      Alert.alert('Sesion requerida', 'Inicia sesion para completar tu perfil.');
      return;
    }

    if (!validateProfile()) return;
    if (!validateUniversity()) return;

    if (!department) {
      Alert.alert('Departamento requerido', 'Selecciona tu departamento para continuar.');
      return;
    }

    if (target === 'vehicle' && !canSaveVehicle) {
      Alert.alert('Vehiculo incompleto', 'Completa marca, modelo y asientos validos (1-8).');
      return;
    }

    setSaving(true);

    const phoneForStorage = toNicaraguaPhoneStorage(phone.trim());
    const universityForStorage = university === OTHER_UNIVERSITY_OPTION
      ? customUniversity.trim()
      : university;
    const { error: profileError } = await updateProfile(user.id, {
      full_name: fullName.trim(),
      phone: phoneForStorage,
      city: department,
      university: universityForStorage,
      student_id: studentId.trim(),
      onboarding_completed_at: new Date().toISOString(),
    });

    if (profileError) {
      setSaving(false);
      Alert.alert('No se pudo guardar', profileError.message);
      return;
    }

    if (target === 'vehicle') {
      const { error: vehicleError } = await createVehicle({
        owner_id: user.id,
        make: make.trim(),
        model: model.trim(),
        color: color.trim() || null,
        plate: plate.trim().toUpperCase() || null,
        seats: parsedSeats,
        photo_url: null,
      });

      if (vehicleError) {
        setSaving(false);
        Alert.alert('No se pudo guardar el vehiculo', vehicleError.message);
        return;
      }
    }

    await refreshProfile();
    setSaving(false);
    router.replace('/(tabs)/buscar');
  };

  const goNext = () => {
    if (step === 1 && !validateProfile()) return;
    if (step === 2 && !validateUniversity()) return;
    if (step === 3 && !department) {
      Alert.alert('Departamento requerido', 'Selecciona tu departamento para continuar.');
      return;
    }
    setStep((current) => Math.min(current + 1, 5) as Step);
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 0) as Step);
  };

  const renderProgress = () => (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        {step > 0 ? (
          <TouchableOpacity
            className="h-10 w-10 rounded-full bg-white items-center justify-center border border-outline-variant/20"
            activeOpacity={0.75}
            onPress={goBack}
          >
            <ArrowLeft size={20} color={Colors.onSurface} />
          </TouchableOpacity>
        ) : (
          <View className="h-10 w-10" />
        )}
        <Text className="font-jakarta-bold text-xs uppercase tracking-wider text-primary">
          Paso {progressStep} de {totalSteps}
        </Text>
        <View className="h-10 w-10" />
      </View>
      <View className="h-2 rounded-full bg-surface-container overflow-hidden">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${(progressStep / totalSteps) * 100}%` }}
        />
      </View>
    </View>
  );

  const renderStep = () => {
    if (step === 0) {
      return (
        <View className="gap-6">
          <View className="items-center gap-5 pt-8">
            <View className="h-24 w-24 rounded-[32px] bg-primary items-center justify-center" style={Shadows.action}>
              <UsersRound size={44} color={Colors.onPrimary} />
            </View>
            <View className="items-center gap-3">
              <Text className="font-jakarta-extrabold text-[34px] leading-[40px] text-on-surface text-center tracking-tight">
                Configura tu cuenta
              </Text>
              <Text className="font-jakarta text-base leading-6 text-on-surface-variant text-center">
                Te guiaremos paso a paso para que puedas buscar viajes o publicar rutas con confianza.
              </Text>
            </View>
          </View>
          <Button title="Empezar" onPress={goNext} icon={<ArrowRight size={20} color={Colors.onPrimary} />} />
        </View>
      );
    }

    if (step === 1) {
      return (
        <View className="gap-5">
          <View className="gap-2">
            <Text className="font-jakarta-extrabold text-[30px] text-on-surface tracking-tight">
              Tus datos personales
            </Text>
            <Text className="font-jakarta text-sm leading-5 text-on-surface-variant">
              Estos datos ayudan a otros usuarios a reconocerte cuando reserves o publiques un viaje.
            </Text>
          </View>

          <View className="bg-white rounded-[26px] p-5 border border-outline-variant/20 gap-4" style={Shadows.surface}>
            <Input
              label="Nombre completo"
              placeholder="Ej. Maria Lopez"
              value={fullName}
              onChangeText={setFullName}
              icon={<UserRound size={20} color={Colors.primary} />}
            />
            <Input
              label="Telefono (+505)"
              placeholder="8888 0000"
              value={phone}
              onChangeText={(value) => setPhone(formatNicaraguaPhoneInput(value))}
              keyboardType="number-pad"
              maxLength={9}
              icon={<Phone size={20} color={Colors.primary} />}
            />
            <Text className="font-jakarta text-xs leading-5 text-on-surface-variant -mt-2 ml-1">
              Usaremos este numero para coordinar reservas y viajes.
            </Text>
          </View>

          <Button title="Continuar" onPress={goNext} icon={<ArrowRight size={20} color={Colors.onPrimary} />} />
        </View>
      );
    }

    if (step === 2) {
      return (
        <View className="gap-5">
          <View className="gap-2">
            <Text className="font-jakarta-extrabold text-[30px] text-on-surface tracking-tight">
              Tu universidad
            </Text>
            <Text className="font-jakarta text-sm leading-5 text-on-surface-variant">
              Usamos esto para conectarte con otros estudiantes de tu campus. Tu carnet queda solo en tu perfil.
            </Text>
          </View>

          <View className="bg-white rounded-[26px] p-5 border border-outline-variant/20 gap-4" style={Shadows.surface}>
            <View className="gap-3">
              <Text className="font-jakarta-semibold text-sm text-on-surface-variant ml-1">
                Universidad
              </Text>
              <TouchableOpacity
                className="h-14 rounded-input bg-surface-container-low px-4 flex-row items-center gap-3"
                activeOpacity={0.75}
                onPress={() => {
                  setUniversitySearch(university && university !== OTHER_UNIVERSITY_OPTION ? university : '');
                  setUniversityPickerVisible(true);
                }}
              >
                <GraduationCap size={20} color={Colors.primary} />
                <Text className={`font-jakarta text-base flex-1 ${university ? 'text-on-surface' : 'text-outline'}`}>
                  {university || 'Selecciona tu universidad'}
                </Text>
                <ChevronDown size={20} color={Colors.outline} />
              </TouchableOpacity>
            </View>

            {university === OTHER_UNIVERSITY_OPTION ? (
              <Input
                label="Nombre de tu universidad"
                placeholder="Ej. Universidad Hispanoamericana"
                value={customUniversity}
                onChangeText={setCustomUniversity}
                icon={<GraduationCap size={20} color={Colors.primary} />}
              />
            ) : null}

            <Input
              label="Carnet"
              placeholder="Ej. 20231234"
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="characters"
              icon={<IdCard size={20} color={Colors.primary} />}
            />
          </View>

          <Button title="Continuar" onPress={goNext} icon={<ArrowRight size={20} color={Colors.onPrimary} />} />
        </View>
      );
    }

    if (step === 3) {
      return (
        <View className="gap-5">
          <View className="gap-2">
            <Text className="font-jakarta-extrabold text-[30px] text-on-surface tracking-tight">
              Elige tu departamento
            </Text>
            <Text className="font-jakarta text-sm leading-5 text-on-surface-variant">
              Usaremos esto para mostrar rutas mas relevantes cerca de ti.
            </Text>
          </View>

          <View className="bg-white rounded-[26px] p-5 border border-outline-variant/20 gap-3" style={Shadows.surface}>
            <Text className="font-jakarta-semibold text-sm text-on-surface-variant ml-1">
              Departamento
            </Text>
            <TouchableOpacity
              className="h-14 rounded-input bg-surface-container-low px-4 flex-row items-center gap-3"
              activeOpacity={0.75}
              onPress={() => {
                setDepartmentSearch(department);
                setDepartmentPickerVisible(true);
              }}
            >
              <MapPin size={20} color={Colors.primary} />
              <Text className={`font-jakarta text-base flex-1 ${department ? 'text-on-surface' : 'text-outline'}`}>
                {department || 'Selecciona tu departamento'}
              </Text>
              <ChevronDown size={20} color={Colors.outline} />
            </TouchableOpacity>
            <Text className="font-jakarta text-xs leading-5 text-on-surface-variant ml-1">
              Esto ayuda a conectar rutas por zona sin pedir tu ubicacion exacta.
            </Text>
          </View>

          <Button title="Continuar" onPress={goNext} icon={<ArrowRight size={20} color={Colors.onPrimary} />} />
        </View>
      );
    }

    if (step === 4) {
      return (
        <View className="gap-5">
          <View className="gap-2">
            <Text className="font-jakarta-extrabold text-[30px] text-on-surface tracking-tight">
              ¿Vas a manejar?
            </Text>
            <Text className="font-jakarta text-sm leading-5 text-on-surface-variant">
              Si quieres publicar viajes como conductor, agrega tu vehiculo ahora. Tambien puedes hacerlo despues.
            </Text>
          </View>

          <View className="bg-white rounded-[26px] p-5 border border-outline-variant/20 gap-3" style={Shadows.surface}>
            <TouchableOpacity
              className="rounded-2xl bg-secondary-container p-5 gap-3"
              activeOpacity={0.8}
              onPress={() => setStep(5)}
            >
              <Car size={26} color={Colors.onSecondaryContainer} />
              <Text className="font-jakarta-bold text-xl text-on-secondary-container">
                Agregar vehiculo ahora
              </Text>
              <Text className="font-jakarta text-sm leading-5 text-on-secondary-container">
                Configura marca, modelo y asientos antes de entrar a la app.
              </Text>
            </TouchableOpacity>

            <Button
              title="Omitir por ahora"
              variant="ghost"
              onPress={() => {
                void saveProfileAndFinish('home');
              }}
              loading={saving}
            />
          </View>
        </View>
      );
    }

    return (
      <View className="gap-5">
        <View className="gap-2">
          <Text className="font-jakarta-extrabold text-[30px] text-on-surface tracking-tight">
            Agrega tu vehiculo
          </Text>
          <Text className="font-jakarta text-sm leading-5 text-on-surface-variant">
            Solo necesitamos lo basico. Podras agregar foto y editarlo luego desde tu perfil.
          </Text>
        </View>

        <View className="bg-white rounded-[26px] p-5 border border-outline-variant/20 gap-4" style={Shadows.surface}>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="Marca" placeholder="Toyota" value={make} onChangeText={setMake} />
            </View>
            <View className="flex-1">
              <Input label="Modelo" placeholder="Corolla" value={model} onChangeText={setModel} />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="Color" placeholder="Gris" value={color} onChangeText={setColor} />
            </View>
            <View className="flex-1">
              <Input label="Asientos" placeholder="4" value={seats} onChangeText={setSeats} keyboardType="number-pad" />
            </View>
          </View>

          <Input label="Placa" placeholder="M 12345" value={plate} onChangeText={setPlate} autoCapitalize="characters" />
        </View>

        <Button
          title="Finalizar"
          onPress={() => {
            void saveProfileAndFinish('vehicle');
          }}
          loading={saving}
          disabled={!canSaveVehicle}
          icon={<CheckCircle2 size={20} color={Colors.onPrimary} />}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 36 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5 pt-5 gap-7">
            {renderProgress()}
            {renderStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={departmentPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDepartmentPickerVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setDepartmentPickerVisible(false)}
          />
          <View className="max-h-[70%] rounded-t-[30px] bg-white px-5 pt-5 pb-8" style={Shadows.bottomBar}>
            <View className="flex-row items-start justify-between pb-5 gap-4">
              <View>
                <Text className="font-jakarta-bold text-xl text-on-surface">
                  Selecciona tu departamento
                </Text>
                <Text className="font-jakarta text-xs text-on-surface-variant mt-1">
                  Puedes cambiarlo despues desde tu perfil.
                </Text>
              </View>
              <TouchableOpacity
                className="h-10 w-10 rounded-full bg-surface-container-low items-center justify-center"
                activeOpacity={0.75}
                onPress={() => setDepartmentPickerVisible(false)}
              >
                <X size={20} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>

            <View className="h-14 rounded-input bg-surface-container-low px-4 flex-row items-center gap-3 mb-4">
              <Search size={20} color={Colors.primary} />
              <TextInput
                className="flex-1 font-jakarta text-base text-on-surface"
                placeholder="Buscar departamento"
                placeholderTextColor={Colors.outline}
                value={departmentSearch}
                onChangeText={setDepartmentSearch}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <ScrollView className="-mx-1" contentContainerStyle={{ gap: 10, paddingHorizontal: 4, paddingBottom: 8 }}>
              {filteredDepartments.map((item) => {
                const selected = department === item;
                return (
                  <TouchableOpacity
                    key={item}
                    className={`min-h-12 rounded-2xl px-4 py-3 flex-row items-center gap-3 ${selected ? 'bg-primary' : 'bg-surface-container-low'}`}
                    activeOpacity={0.75}
                    onPress={() => {
                      setDepartment(item);
                      setDepartmentSearch(item);
                      setDepartmentPickerVisible(false);
                    }}
                  >
                    <MapPin size={18} color={selected ? Colors.onPrimary : Colors.primary} />
                    <Text className={`font-jakarta-bold text-sm flex-1 ${selected ? 'text-on-primary' : 'text-on-surface'}`}>
                      {item}
                    </Text>
                    {selected ? <CheckCircle2 size={18} color={Colors.onPrimary} /> : null}
                  </TouchableOpacity>
                );
              })}
              {filteredDepartments.length === 0 ? (
                <View className="rounded-2xl bg-surface-container-low px-4 py-5 items-center">
                  <Text className="font-jakarta-semibold text-sm text-on-surface-variant">
                    No encontramos ese departamento.
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        visible={universityPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUniversityPickerVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setUniversityPickerVisible(false)}
          />
          <View className="max-h-[70%] rounded-t-[30px] bg-white px-5 pt-5 pb-8" style={Shadows.bottomBar}>
            <View className="flex-row items-start justify-between pb-5 gap-4">
              <View>
                <Text className="font-jakarta-bold text-xl text-on-surface">
                  Selecciona tu universidad
                </Text>
                <Text className="font-jakarta text-xs text-on-surface-variant mt-1">
                  Si la tuya no aparece, elige &quot;Otra&quot; y escribe el nombre.
                </Text>
              </View>
              <TouchableOpacity
                className="h-10 w-10 rounded-full bg-surface-container-low items-center justify-center"
                activeOpacity={0.75}
                onPress={() => setUniversityPickerVisible(false)}
              >
                <X size={20} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>

            <View className="h-14 rounded-input bg-surface-container-low px-4 flex-row items-center gap-3 mb-4">
              <Search size={20} color={Colors.primary} />
              <TextInput
                className="flex-1 font-jakarta text-base text-on-surface"
                placeholder="Buscar universidad"
                placeholderTextColor={Colors.outline}
                value={universitySearch}
                onChangeText={setUniversitySearch}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <ScrollView className="-mx-1" contentContainerStyle={{ gap: 10, paddingHorizontal: 4, paddingBottom: 8 }}>
              {filteredUniversities.map((item) => {
                const selected = university === item;
                return (
                  <TouchableOpacity
                    key={item}
                    className={`min-h-12 rounded-2xl px-4 py-3 flex-row items-center gap-3 ${selected ? 'bg-primary' : 'bg-surface-container-low'}`}
                    activeOpacity={0.75}
                    onPress={() => {
                      setUniversity(item);
                      if (item !== OTHER_UNIVERSITY_OPTION) {
                        setUniversitySearch(item);
                      } else {
                        setUniversitySearch('');
                      }
                      setUniversityPickerVisible(false);
                    }}
                  >
                    <GraduationCap size={18} color={selected ? Colors.onPrimary : Colors.primary} />
                    <Text className={`font-jakarta-bold text-sm flex-1 ${selected ? 'text-on-primary' : 'text-on-surface'}`}>
                      {item}
                    </Text>
                    {selected ? <CheckCircle2 size={18} color={Colors.onPrimary} /> : null}
                  </TouchableOpacity>
                );
              })}
              {filteredUniversities.length === 0 ? (
                <View className="rounded-2xl bg-surface-container-low px-4 py-5 items-center">
                  <Text className="font-jakarta-semibold text-sm text-on-surface-variant">
                    No encontramos esa universidad.
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
