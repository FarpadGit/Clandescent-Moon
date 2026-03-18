import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: {
        description: {
          intro: `Welcome to Clandescent Moon, an online playlist editor that let's
              you listen to music or watch videos from Youtube, Vimeo,
              DailyMotion and many other major video sharing platform.`,
          header1: `How does this work?`,
          paragraph1: `Clandescent Moon saves your playlists directly to the browser's
              Local Storage as text data. It doesn't care who you are or what
              cloud services do you use. You could use this site offline... if
              you could watch Youtube videos offline. Ideal for long nights of
              sitting at your desk and coding the night away :).`,
          header2: `What can I do?`,
          paragraph2: `Just add a new Playlist on the right by giving it a new name,
              click into it and on the Videos tab paste in whatever URL you want
              to add to that playlist. That's it! And if that URL just so happens to be a Youtube Playlist
              it will even add every video from that playlist into yours.
              By default every change you make is automatically saved into Local Storage, so as long as
              you're using the same browser your playlists will be there as
              well. But you can also export and import playlists as CSV text
              files or as data uploaded to an external storage if you want to transfer them somewhere else. 
              Just look into the Settings (⚙️) tab for more info. `,
          header3: `What videos can I play?`,
          paragraph3: `This site uses ReactPlayer as the actual underlying video player,
              which supports YouTube, Facebook, Twitch, SoundCloud, Streamable,
              Vimeo, Wistia, Mixcloud, DailyMotion and Kaltura. There's a good
              chance if you add a URL from any of these sites it will play it.
              <br />
              Just be aware that by default Clandescent Moon will assume that
              the URLs you try to enter are coming from Youtube and will try to
              autocorrect them if they're not formatted as such. You can turn
              this off in the Settings tab or edit them back manually.`,
          header4: `You got any playlists I can start with?`,
          paragraph4: `Damn right we do 👍. Just scroll down in the Settings tab and load one of our preset playlists with the click of a button. Happy headbanging 😎.`,
        },
        playlistsTab: "Playlists",
        videosTab: "Videos",
        settingsTab: "⚙️",
        emptyList:
          "This list is currently empty. Try adding some new items to it.",
        loadingMessage: "Loading your playlist...",
        loadError:
          "An error occured while trying to read your playlists from Local Storage. Create a new list to reset old data or try fixing it manually.",
        playlists: {
          counter: "videos",
        },
        videos: {
          unknownTitle: "Unknown Video",
          controls: {
            editButton: "Edit Item",
            editSaveButton: "Accept Changes",
            moveUpButton: "Move Up\nLong press: Move to Top",
            moveDownButton: "Move Down\nLong press: Move to Bottom",
            deleteButton: "Delete Item",
          },
        },
        options: {
          ON: "ON",
          OFF: "OFF",
          LOADING: "One moment... ",
          DONE: "Done",
          ERROR: "Failed",
          DOWNLOADID: "Download id",
          autosave: {
            title: "Autosaving",
            description: `When turned <strong>ON</strong> every change you make to your playlists will be
          automatically saved to Local Storage. Turn this <strong>OFF</strong> if you want
          to do something without making it a permament change.`,
          },
          playback: {
            title: "Current playback mode",
            mode: {
              linear: "Linear mode",
              shuffle: "Shuffle mode",
              random: "Random mode",
            },
            description: `<strong>Linear Mode:</strong> 
          Videos will be played from top to bottom, in the order they appear on
          the list.
          <br />
          <strong>Shuffle Mode:</strong> 
          Videos will be played in a random order but it will go through the
          whole playlist.
          <br />
          <strong>Random Mode:</strong> A new video will be randomly selected after the
          last one ended, even if you have already played it.`,
          },
          autocorrect: {
            title: "Youtube autocorrecting",
            description: `When turned <strong>ON</strong> new manually added URLs that don't start with
          'youtube.com' will be assumed to be youtube IDs and will be corrected
          accordingly. Turn this <strong>OFF</strong> if you plan on adding a lot of
          non-youtube sources and don't want to edit them back one by one.`,
          },
          fileupload: {
            title: "Use Medea for temporary storage",
            description: `When turned <strong>ON</strong> exported playlists will be temporarily saved to Medea (a temporary file and image sharing storage), and imports will also be
            downloaded from there. Useful for transferring your playlists from one device to another by persisting it to the 'cloud'. These uploads will be deleted after 27 days or after 
            the first time they're downloaded. If turned <strong>OFF</strong> you will download/upload files locally.`,
          },
          import: {
            title: {
              local: "Import playlist from file",
              external: "Import playlist from storage",
            },
            description: `Import one or more playlists from an appropriately formatted CSV file.
          The playlists' names should be included in the very first row and any
          preexisting playlist with the same name will be overwritten after import. An example for the file format:<br/><br/>
            Playlist A;Playlist B<br/>
            firstUrlForListA;firstUrlForListB<br/>
            secondUrlForListA;secondUrlForListB`,
          },
          export: {
            title: {
              local: {
                all: "Export all playlists to file",
                current: "Export active playlist to file",
              },
              external: {
                all: "Export all playlists to storage",
                current: "Export active playlist to storage",
              },
            },
            description: `Save all or just the currently playing playlist into a CSV file. The
          delimiter will be a semicolon but the import function can handle
          commas too.`,
          },
          presets: {
            title: "Available preset playlists",
            label: `load "{{name}}"`,
            description: `Load one of our premade playlists into your collection. (Just make
          sure you don't already have a playlist with the same exact name, it
          will be overwritten.)`,
          },
        },
      },
    },
    hu: {
      translation: {
        description: {
          intro: `Üdv a Clandescent Moon-on! Ez egy olyan online lejátszási lista szerkesztő amivel 
              zenéket és videókat játhatsz le a Youtube-ról, Vimeo-ról,
              DailyMotion-ről vagy bármelyik másik nagyobb videómegosztó webhelyről.`,
          header1: `Hogyan is működik ez?`,
          paragraph1: `A Clandescent Moon közvetlenül a böngésző Helyi Tárolójába (Local Storage) menti le az általad készített 
              lejátszási listákat szöveges adat formájában. Teljesen hidegen hadja, hogy ki vagy vagy melyik felhő szolgáltatást használod.
              Ezt az oldalt akár offline is tudnád használni... ha tudnál offline Youtube videókat nézni. 
              Ideális hosszú, ülve töltött estékre amikor végigprogramozod az éjszakát :).`,
          header2: `Miket tudok csinálni?`,
          paragraph2: `Csak hozz létre egy új lejátszási listát a jobb oldalon azzal hogy adsz neki egy nevet,
              kattints bele és a Videók fülön másold be azt az URL-t amit hozzá akarsz adni a listádhoz. 
              Ennyi az egész! Sőt, ha hagyományos azonosító helyett egy Youtube Playlist URL-jét másolod be akkor 
              ráadásként az összes benne szereplő videót hozzáadja a te listádhoz.
              Alapvetően minden változás amit a listáidon végzel automatikusan elmentődik a Helyi Tárolóba, 
              vagyis amíg ugyanezt a böngészőt használod addig a lejátszási listáid is itt lesznek. 
              De lehetőséged van importálni vagy exportálni is listákat CSV szöveges fájlokként vagy külső tárhelybe mentett adatként is 
              ha szeretnéd máshova is áthozni őket. Nézz bele a Beállítások (⚙️) fülbe a részletekért. `,
          header3: `Milyen videókat tudok lejátszani?`,
          paragraph3: `Ez az oldal ReactPlayer-t használ mint a valódi mögöttes videólejátszó, 
              ami támogatja a YouTube, Facebook, Twitch, SoundCloud, Streamable,
              Vimeo, Wistia, Mixcloud, DailyMotion és Kaltura videóit. Ha ezek közül bármelyik oldalról hozzáadsz egy URL-t akkor jó eséllyel le fogod tudni játszani.
              <br />
              Csak arra figyelj, hogy alapvetően a Clandescent Moon feltételezi, hogy minden újonnan hozzáadott URL egy Youtube videó azonosítója akar lenni, 
              és ennek megfelelően megpróbálja kijavítani őket. Ezt ki tudod kapcsolni a Beállítások fülön vagy manuálisan vissza tudod szerkeszteni őket.`,
          header4: `Van valamilyen kezdő zenétek?`,
          paragraph4: `Még szép, hogy van 👍. Csak görgess le a Beállítások fülön és töltsd be az egyik előre összerakott lejátszási listánkat egyetlen kattintással. Happy headbanging 😎.`,
        },
        playlistsTab: "Lejátszási listák",
        videosTab: "Videók",
        settingsTab: "⚙️",
        emptyList: "Ez a lista jelenleg üres. Próbálj hozzáadni valamit.",
        loadingMessage: "Lista betöltése folyamatban...",
        loadError:
          "Hiba történt a listáid Helyi Tárolóból való kiolvasása közben. Hozz létre egy új listát hogy lenullázzuk a régi adatokat vagy próbáld meg manuálisan kijavítani.",
        playlists: {
          counter: "videó",
        },
        videos: {
          unknownTitle: "Ismeretlen Videó",
          controls: {
            editButton: "Szerkesztés",
            editSaveButton: "Változások mentése",
            moveUpButton:
              "Mozgatás felfelé\nHosszú Kattintás: Mozgatás az elejére",
            moveDownButton:
              "Mozgatás lefelé\nHosszú Kattintás: Mozgatás a végére",
            deleteButton: "Törlés",
          },
        },
        options: {
          ON: "BE",
          OFF: "KI",
          LOADING: "Egy pillanat... ",
          DONE: "Kész",
          ERROR: "Hiba történt",
          DOWNLOADID: "Letöltési azonosító",
          autosave: {
            title: "Auto mentés",
            description: `Ha <strong>BE</strong> van kapcsolva akkor minden lejátszási listán végzett változás autómatikusan elmentésre kerül a Helyi Tárolóba (Local Storage). 
            Akkor kapcsold <strong>KI</strong>, ha csak valami ideiglenes változást szeretnél csinálni amit vissza lehet állítani.`,
          },
          playback: {
            title: "Aktuális lejátszási mód",
            mode: {
              linear: "Lineáris mód",
              shuffle: "Kevert mód",
              random: "Random mód",
            },
            description: `<strong>Lineáris mód:</strong> 
          A videókat egymás után játssza le fentről lefelé, ahogy a listában szerepelnek.
          <br />
          <strong>Kevert mód (Shuffle):</strong> 
          A videókat véletlen sorrendben játssza le, de az egész lejátszási listán végigmegy.
          <br />
          <strong>Random mód:</strong> A következő videót teljesen véletlenül választja ki, még akkor is ha már volt korábban.`,
          },
          autocorrect: {
            title: "Youtube auto helyesbítés",
            description: `Ha <strong>BE</strong> állapotban van akkor az újonnan hozzáadott URL címekről automatikusan feltételezi,
            hogy Youtube videók azonosítói, és ha hiányzik belőlük a 'youtube.com' rész akkor ennek megfelelően megpróbálja kijavítani őket. 
            Akkor kapcsold <strong>KI</strong>, ha sok máshonnan származó címet szeretnél hozzáadni és nem szeretnéd őket egyesével visszaszerkeszteni a felvétel után.`,
          },
          fileupload: {
            title: "Medea használata ideiglenes tárolásra",
            description: `Ha <strong>BE</strong> állapotban van akkor az exportált lejátszási listákat ideiglenesen elmenti a Medea ideiglenes tárhelyre és az 
            importálás is innen tölti le őket. Hasznos ha a "felhőn" keresztül át szeretnéd menteni a listáidat egyik eszközről a másikra. Ezek a feltöltések 27 nap után törlődnek az oldalról  
            vagy az első letöltést követően. <strong>KI</strong> kapcsolt állapotban a lejátszási listáidat lokális fájlokként kell fel- és letöltened.`,
          },
          import: {
            title: {
              local: "Lejátszási lista importálása fájlból",
              external: "Lejátszási lista importálása tárolóból",
            },
            description: `Tölts be egy vagy több lejátszási listát egy megfelelően formázott CSV fájlból.
            A listák nevének szerepelnie kell az első adatsorban és betöltés után felülír minden már létező azonos nevű lejátszási listát.
            Egy példa a fájl tartalmi formájára:<br/><br/>
            lista név A;lista név B<br/>
            elsoVideoUrlA;elsoVideoUrlB<br/>
            masodikVideoUrlA;masodikVideoUrlB`,
          },
          export: {
            title: {
              local: {
                all: "Összes lejátszási lista exportálása fájlba",
                current: "Aktív lejátszási lista exportálása fájlba",
              },
              external: {
                all: "Összes lejátszási lista exportálása tárolóba",
                current: "Aktív lejátszási lista exportálása tárolóba",
              },
            },
            description: `Mentsd el az összes vagy csak a jelenleg játszott lejátszási listát egy CSV fájlba. A határoló karakterek pontosvesszők lesznek 
            de az importáló funkció vesszőket is elfogad.`,
          },
          presets: {
            title: "Előre elkészített lejátszási listák",
            label: `"{{name}}" betöltése`,
            description: `Töltsd be valamelyik előre összerakott lejátszási listánkat a kollekciódba. 
            (Csak győződj meg róla, hogy nem létezik-e már egy ugyanilyen nevű listád, ezeket felül fogja írni.)`,
          },
        },
      },
    },
  },
});

export default i18n;
